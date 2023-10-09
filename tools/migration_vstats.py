from datetime import datetime, timezone, timedelta
import argparse
import csv
import sqlite3

parser = argparse.ArgumentParser()
parser.add_argument('file', help='Please select csv file.')

dbname = '../holoapp/db/development.sqlite3'
conn = sqlite3.connect(dbname)
cursor = conn.cursor()


def get_csv(filename):
    """
    CSVファイルから追加・更新対象のメンバーを取得する関数

    Parameters
    ------------------------------------------------------------------------
    filename (string)    : コマンドライン引数で渡されるCSVファイル名

    Returns
    ------------------------------------------------------------------------
    rows (list)          : CSVから取得した過去データ
    """
    rows = []
    dt = datetime.now(timezone.utc).strftime('%Y-%m-%d %H:%M:%S')
    member_dic = get_member_dict()
    with open(filename, encoding='utf8', mode='r') as f:
        datas = eval(f.read())
        for data in datas:
            utc_dt = datetime.fromtimestamp(data[0]//1000)
            name = filename.replace('.csv', '').replace('.\\csv\\', '')
            member_id = member_dic[name]
            subscriber = data[1]
            rows.append([member_id,utc_dt,subscriber,0,0,dt,dt])

    return rows


def get_member_dict():
    """
    DBからmember_idを取得する
    """
    sql = 'SELECT id, name FROM members;'
    cursor.execute(sql)
    result = cursor.fetchall()
    member_dict = {}
    for member in result:
        member_dict[member[1]] = member[0]
    return member_dict


def insert_data(datas):
    sql = 'INSERT INTO trackers(member_id, datetime, subscriber, video_count, video_viewcount, created_at, updated_at) VALUES(?, ?, ?, ?, ?, ?, ?)'
    cursor.executemany(sql, datas)
    conn.commit()


if __name__ == '__main__':
    args = parser.parse_args()
    datas = get_csv(args.file)
    insert_data(datas)