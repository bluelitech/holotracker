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
    delete_rows = []
    dt = datetime.now(timezone.utc).strftime('%Y-%m-%d %H:%M:%S')
    member_dic = get_member_dict()
    with open(filename, encoding='utf8') as f:
        datas = csv.reader(f)
        for row in datas:
            jst_str = row[0]
            jst_str_len = len(jst_str)
            if jst_str_len == 10:
                jst_str += ' 00:00:00'
            elif jst_str_len == 16:
                jst_str += ':00'
            jst_dt = datetime.strptime(jst_str, '%Y-%m-%d %H:%M:%S')
            utc_dt = jst_dt - timedelta(hours=9)
            name = row[1]
            if name == '森美声':
                name = '森カリオペ'
            elif name == 'アイリス':
                name = 'IRyS'
            elif name == '古石ビジュ―':
                name = '古石ビジュー'
            member_id = member_dic[name]
            subscriber = row[2]
            rows.append([member_id,utc_dt,subscriber,row[3],row[4],dt,dt])
            # delete_rows.append([member_id, utc_dt, subscriber])
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

def delete_data(datas):
    sql = 'DELETE FROM trackers WHERE member_id=? AND datetime=? AND subscriber=?'
    cursor.executemany(sql, datas)
    conn.commit()

if __name__ == '__main__':
    args = parser.parse_args()
    datas = get_csv(args.file)
    insert_data(datas)
    # delete_data(datas)
