import sqlite3
import warnings
from datetime import datetime, timezone, timedelta

import pandas as pd
from statsmodels.tsa.arima.model import ARIMA
from statsmodels.tools import sm_exceptions
import json


# ARIMAの警告を非表示にする
warnings.simplefilter('ignore', sm_exceptions.ConvergenceWarning)
warnings.simplefilter('ignore', UserWarning)

# DB
dbname = '../holoapp/db/development.sqlite3'
conn = sqlite3.connect(dbname)
cursor = conn.cursor()


def get_members():
    """
    DBからメンバーIDを取得する

    Returns
    ------------------------------------------------------------------------
    result (dict)  : メンバーごとのidの辞書
    """
    sql = 'SELECT id, name_url FROM members WHERE active=true'
    cursor.execute(sql)
    result = cursor.fetchall()
    members = {}
    for member in result:
        members[member[0]] = member[1]
    return members


def get_subscriber_one(member_id):
    """
    指定したメンバーの1日ごとのチャンネル登録者数を取得する

    Parameters
    ------------------------------------------------------------------------
    member_id (int)        : データを取得したいメンバーのメンバーID

    Returns
    ------------------------------------------------------------------------
    subscriber_dic (dict)  : 1日ごとのチャンネル登録者数
    """
    sql = 'SELECT strftime("%Y-%m-%d", MAX(datetime)) AS dt, subscriber FROM trackers WHERE member_id=? GROUP BY strftime("%Y%m%d", datetime), member_id ORDER BY datetime ASC'
    cursor.execute(sql, [member_id])
    result = cursor.fetchall()
    subscriber_dict = dict(result)
    return subscriber_dict


def get_date(subscribers):
    """
    取得したデータから一番過去の日付と一番最後の日付を取得する

    Parameters
    ------------------------------------------------------------------------
    subscribers (dict)     : 1日ごとのチャンネル登録者数

    Returns
    ------------------------------------------------------------------------
    min_date (string)      : 一番過去の日付
    max_date (string)      : 一番最後の日付
    """
    min_date_str = min(subscribers.keys())
    max_date_str = datetime.now().strftime('%Y-%m-%d')
    min_date = datetime.strptime(min_date_str, '%Y-%m-%d') + timedelta(days=30)
    max_date = datetime.strptime(max_date_str, '%Y-%m-%d')
    return min_date, max_date


def make_dataframe(subscribers):
    """
    取得したデータから一番過去の日付と一番最後の日付を取得する

    Parameters
    ------------------------------------------------------------------------
    subscribers (dict)     : 1日ごとのチャンネル登録者数

    Returns
    ------------------------------------------------------------------------
    df (dataframe)         : 日付とその日のチャンネル登録者数を解析できる形式にしたもの
    subscriber_max (int)   : 取得した範囲で一番大きいチャンネル登録者数の値
    """
    min_date, max_date = get_date(subscribers)
    date_list = []
    subscriber_list = []
    prev_subscriber = 0

    # 対象の最古の日付から今日までループ
    current_date = min_date
    cnt = 1
    while current_date <= max_date:
        current_date_str = current_date.strftime('%Y-%m-%d')
        date_list.append(current_date_str)

        # データ欠損対策時に使用するsubscriberの値を更新する
        subscriber = subscribers.get(current_date_str)
        if subscriber is not None:
            prev_subscriber = subscriber
        
        subscriber_list.append(prev_subscriber)

        # 次の日に移動
        current_date += timedelta(days=1)
        cnt += 1

    data = {
        'date': date_list,
        'subscribers': subscriber_list
    }

    df = pd.DataFrame(data)
    df['date'] = pd.to_datetime(df['date'])
    df.set_index('date', inplace=True)
    subscriber_max = max(subscribers.values())
    return df, subscriber_max


def forecasts(member_id, df, subscriber_max):
    """
    ミリオン予測を行う

    Parameters
    ------------------------------------------------------------------------
    member_id (int)        : 予測対象のメンバーID
    df (dataframe)         : 日付とその日のチャンネル登録者数を解析できる形式にしたもの
    subscriber_max (int)   : 取得した範囲で一番大きいチャンネル登録者数の値

    Returns
    ------------------------------------------------------------------------
    result (dict)          : 予測結果
    """
    next_million = ((subscriber_max // 1000000) + 1) * 1000000

    model = ARIMA(df['subscribers'], order=(1,1,3))
    results = model.fit()

    now = datetime.now()
    end = now + timedelta(days=1095)
    start_date = (now).strftime('%Y-%m-%d')
    end_date = end.strftime('%Y-%m-%d')

    pred = results.predict(start=start_date, end=end_date, dynamic=False)

    check = 0
    target = 0
    forecast_day = []
    forecast_subscriber = []
    for day, subscriber in zip(pd.date_range(start=df.index[-1], periods=len(pred)+1)[1:], pred):
        check = (subscriber // 10000) * 10000
        if check != target and check % 100000 == 0:
            target = check
            forecast_day.append(day)
            forecast_subscriber.append(check)
        if check >= next_million:
            break

    result = {
        'member_id': member_id,
        'subscriber': int(subscriber_max),
        'next_million': next_million
    }

    if len(forecast_subscriber) == 0:
        # 予測失敗
        result['date'] = '-'
        result['forecast_subscriber'] = 0
        result['result'] = 'unforeseeable'
    elif subscriber < next_million:
        # ミリオン未到達
        result['date'] = forecast_day[0].strftime('%Y-%m-%d')
        result['forecast_subscriber'] = int(forecast_subscriber[0])
        result['result'] = 'unreachable'
    else:
        # ミリオン到達
        result['date'] = forecast_day[-1].strftime('%Y-%m-%d')
        result['forecast_subscriber'] = next_million
        result['result'] = 'success'
    
    return result


if __name__ == '__main__':
    dt = datetime.now(timezone.utc).strftime('%Y-%m-%d %H:%M:%S')    
    members = get_members()
    forecasts_list = []
    for member_id in members:
        subscribers = get_subscriber_one(member_id)
        if len(subscribers) == 0:
            # データなし
            forecasts_list.append({
                'member_id': member_id,
                'subscriber': 0,
                'forecast_subscriber': 0,
                'result': 'shortage',
                'date': '-'
            })

        df, subscriber_max = make_dataframe(subscribers)
        if subscriber_max > 0 and len(df['subscribers']) >= 30:
            forecasts_list.append(forecasts(member_id, df, subscriber_max))
        else:
            # データ不足
            forecasts_list.append({
                'member_id': member_id,
                'subscriber': subscriber_max,
                'forecast_subscriber': 0,
                'result': 'shortage',
                'date': '-'
            })

    # 予測結果保存
    with open('../data/forecasts.json', 'w') as f:
        json.dump(forecasts_list, f)
