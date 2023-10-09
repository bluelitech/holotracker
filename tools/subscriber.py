from googleapiclient.discovery import build
from datetime import datetime, timezone, timedelta
import sqlite3
import json

from config import YOUTUBE_API_KEY

# DB
dbname = '../holoapp/db/development.sqlite3'
conn = sqlite3.connect(dbname)
cursor = conn.cursor()


def get_members():
    """
    DBからYoutubeのIDを取得する

    Returns
    ------------------------------------------------------------------------
    result (tupple)  : メンバーごとのidとyoutube_idの一覧
    """
    sql = 'SELECT id, name_url, youtube_id FROM members'
    cursor.execute(sql)
    result = cursor.fetchall()
    members = {}
    for member in result:
        members[member[0]] = {'name': member[1], 'youtube_id': member[2]}
    return members


def get_channel_data(channel_id):
    """
    Youtube APIからチャンネルデータを取得する関数

    Parameters
    ------------------------------------------------------------------------
    channel_id (string)  : 取得したいYoutubeチャンネルのID

    Returns
    ------------------------------------------------------------------------
    channel_data (dict)  : Membersテーブルを更新するときに使用するSQL
    """
    api_service_name = 'youtube'
    api_version = 'v3'
    youtube = build(api_service_name, api_version, developerKey=YOUTUBE_API_KEY)
    search_response = youtube.channels().list(
        part='snippet, statistics',
        id=channel_id,
    ).execute()

    return search_response['items'][0]


def get_round_dict():
    """
    DBに登録されている最新のキリ番を取得する関数

    Returns
    ------------------------------------------------------------------------
    round_dict (dict)  : メンバーごとの最新のキリ番（10万人単位）の一覧
    """
    check_round_sql = 'SELECT min(datetime) AS dt, member_id, subscriber FROM trackers WHERE subscriber % 100000 = 0 GROUP BY subscriber, member_id ORDER BY subscriber ASC'
    cursor.execute(check_round_sql)
    result = cursor.fetchall()

    round_dict = {}
    diff = 0
    for data in result:
        utc_dt = datetime.strptime(data[0], '%Y-%m-%d %H:%M:%S')
        jst_dt = utc_dt.astimezone(timezone(timedelta(hours=18)))
        jst_str = jst_dt.strftime('%Y-%m-%d %H:%M')
        member_id = data[1]
        subscriber = data[2]

        if member_id in round_dict:
            last_data = round_dict[member_id]['rounds'][-1]
            diff = subscriber - last_data['subscriber']
            round_data = {'datetime': jst_str, 'subscriber': subscriber, 'diff': diff}

            # latestに設定済みの登録者数よりも大きければ更新
            if subscriber > round_dict[member_id]['latest']['subscriber']:
                round_dict[member_id]['latest'] = round_data
            elif subscriber == round_dict[member_id]['latest']['subscriber']\
                and jst_dt < datetime.strptime(round_dict[member_id]['latest']['datetime'], '%Y-%m-%d %H:%M').astimezone(timezone(timedelta(hours=18))):
                round_dict[member_id]['latest'] = round_data

            # キリ番を追加
            round_dict[member_id]['rounds'].append(round_data)
        else:
            round_data = {'datetime': jst_str, 'subscriber': subscriber, 'diff': 0}
            round_dict[member_id] = {
                'latest': round_data,
                'rounds': [round_data]
            }

    return round_dict


def apply_db(dt, member_id, channel_data, inserted_round_subscriber):
    """
    Parameters
    ------------------------------------------------------------------------
    dt (string)                 : チャンネルデータ取得日時
    member_id (int)             : メンバーのID
    channel_data                : Youtubeから取得したチャンネルデータ
    inserted_round_subscriber   : 登録済みの最新のキリ番登録者数（10万人単位）
    """
    # チャンネルデータの更新
    update_sql = 'UPDATE members SET channel_name=?, thumbnails=? WHERE id=?'

    data = [
        channel_data['snippet']['title'],
        channel_data['snippet']['thumbnails']['default']['url'],
        member_id
    ]
    cursor.execute(update_sql, data)

    # 最新のチャンネル登録者数の追加
    tracker_sql = 'INSERT INTO trackers(member_id, datetime, subscriber, video_count, video_viewcount, created_at, updated_at) VALUES(?, ?, ?, ?, ?, ?, ?)'
    tracker_data = [
        member_id,
        dt,
        channel_data['statistics']['subscriberCount'],
        channel_data['statistics']['videoCount'],
        channel_data['statistics']['viewCount'],
        dt,
        dt
    ]
    cursor.execute(tracker_sql, tracker_data)

    # キリ番
    round_subscriber = int(channel_data['statistics']['subscriberCount']) // 100000 * 100000

    if round_subscriber == 0:
        return

    if round_subscriber != inserted_round_subscriber:
        cursor.execute(tracker_sql, [
            member_id,
            dt,
            round_subscriber,
            channel_data['statistics']['videoCount'],
            channel_data['statistics']['viewCount'],
            dt,
            dt
        ])

    conn.commit()


def update_latest_data(round_dict, dt):
    # 最新の登録者数取得
    latest_subscriber_sql = 'SELECT member_id, subscriber, strftime("%Y-%m-%d %H:%M", MAX(datetime)) FROM trackers GROUP BY member_id'
    cursor.execute(latest_subscriber_sql)
    latest_subscribers = cursor.fetchall()

    # 前日最後の登録者数を取得
    yesterday_subscriber_sql = 'SELECT member_id, subscriber, strftime("%Y-%m-%d %H:%M", MAX(datetime)) FROM trackers WHERE datetime>=datetime("now", "-1 day") AND datetime<datetime("now") GROUP BY member_id'
    cursor.execute(yesterday_subscriber_sql)
    yesterday_subscribers = cursor.fetchall()

    # 前日の登録者数を辞書型に変形
    yesterday_subscribers_dict = {}
    for yesterday_data in yesterday_subscribers:
        yesterday_subscribers_dict[yesterday_data[0]] = {
            'subscriber': yesterday_data[1],
            'datetime': yesterday_data[2],
        }

    # 最新データ作成
    latest_data_list = []
    for member_data in latest_subscribers:
        member_id = member_data[0]
        member_subscriber = member_data[1]

        # 前日との差分を計算
        if member_id in yesterday_subscribers_dict:
            diff = member_subscriber - yesterday_subscribers_dict[member_id]['subscriber']
        else:
            diff = member_subscriber
        
        latest_data_list.append([
            member_subscriber,
            diff,
            round_dict[member_id]['latest']['subscriber'],
            round_dict[member_id]['latest']['datetime'],
            dt,
            member_id
        ])

    # 最新データを更新
    latest_sql = 'UPDATE latests SET subscriber=?, diff=?, round_subscriber=?, round_datetime=?, updated_at=? WHERE member_id=?'
    cursor.executemany(latest_sql, latest_data_list)
    conn.commit()


def make_alldata():
    sql = 'SELECT member_id, subscriber, max(datetime) AS dt FROM trackers GROUP BY strftime("%Y%m", datetime), member_id'
    cursor.execute(sql)
    result = cursor.fetchall()

    holodata = []
    for data in result:
        member_id = data[0]
        subscriber = data[1]
        utc_dt = datetime.strptime(data[2], '%Y-%m-%d %H:%M:%S').astimezone(timezone(timedelta(hours=18)))
        jst_dt = utc_dt.strftime('%Y-%m-%d %H:%M:%S')
        holodata.append({
            'member_id': member_id,
            'subscriber': subscriber,
            'dt': jst_dt,
        })
    
    with open('../data/holodata.json', 'w') as f:
        json.dump(holodata, f)


def make_round_data(members, round_dict):
    data = {}
    for member_id in round_dict:
        data[members[member_id]['name']] = round_dict[member_id]['rounds']
    with open('../data/rounds.json', 'w') as f:
        json.dump(data, f)


if __name__ == '__main__':
    dt = datetime.now(timezone.utc).strftime('%Y-%m-%d %H:%M:%S')    
    members = get_members()
    round_dict = get_round_dict()
    
    for member_id in members:
        member = members[member_id]
        channel_data = get_channel_data(member['youtube_id'])

        # チャンネル登録者数が非公開になっていたらスルー
        if channel_data['statistics']['hiddenSubscriberCount']:
            continue

        inserted_round_subscriber = round_dict[member_id]['latest']['subscriber'] if member_id in round_dict else 0
        apply_db(dt, member_id, channel_data, inserted_round_subscriber)

    # 重いデータをエクスポート
    update_latest_data(round_dict, dt)
    make_alldata()
    make_round_data(members, get_round_dict())
