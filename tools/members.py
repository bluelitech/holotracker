from datetime import datetime, timezone
import argparse
import csv
import sqlite3

parser = argparse.ArgumentParser()
parser.add_argument('file', help='Please select csv file.')
parser.add_argument('mode', help='Set "add" or "update".')

dbname = '../holoapp/db/development.sqlite3'
conn = sqlite3.connect(dbname)
cursor = conn.cursor()


def get_csv(mode, filename):
    """
    CSVファイルから追加・更新対象のメンバーを取得する関数

    Parameters
    ------------------------------------------------------------------------
    mode (string)        : コマンドライン引数で add もしくは update が渡される
    filename (string)    : コマンドライン引数で渡されるCSVファイル名

    Returns
    ------------------------------------------------------------------------
    rows (list)          : CSVから取得した追加・更新対象のメンバー一覧
    """
    rows = []
    name_index = 0
    dt = datetime.now(timezone.utc).strftime('%Y-%m-%d %H:%M:%S')
    with open(filename, encoding='utf8') as f:
        datas = csv.reader(f)
        for idx, row in enumerate(datas):
            match mode:
                case 'add':
                    if idx == 0:
                        row.append('created_at')
                        row.append('updated_at')
                    else:
                        row.append(dt)
                        row.append(dt)
                case 'update':
                    if idx == 0:
                        name_index = row.index('name')
                        row.append('updated_at')
                    else:
                        row.append(dt)
                        row.append(row[name_index])
            
            rows.append(row)
    return rows


def make_sql(mode, columns):
    """
    CSVファイルの構成によってSQLを構築する関数

    Parameters
    ------------------------------------------------------------------------
    mode (string)    : コマンドライン引数で add もしくは update が渡される
    columns (list)   : CSVファイルヘッダー部分のカラム名

    Returns
    ------------------------------------------------------------------------
    sql (string)     : Membersテーブルを更新するときに使用するSQL
    """
    sql = None
    match mode:
        case 'add':
            sql = 'INSERT INTO members ('
            sql_args = ''
            for idx, column in enumerate(columns):
                if idx > 0:
                    sql += ','
                    sql_args += ','
                sql += column
                sql_args += '?'
            sql += f') VALUES ({sql_args});'
        case 'update':
            sql = 'UPDATE members SET '
            for idx, column in enumerate(columns):
                sql += f'{column}=?'
                if idx < len(columns) - 1:
                    sql += ', '
                else:
                    sql += ' '
            sql += f'WHERE name=?;'
    return sql


def exec_sql(sql, datas):
    """
    DBに反映させる関数

    Parameters
    ------------------------------------------------------------------------
    sql (string)    : 実行するSQL
    datas (list)    : 実行するSQLと一緒に渡す引数
    """
    cursor.executemany(sql, datas)
    conn.commit()


def add_latest(datas):
    """
    新規追加したメンバーをlatestテーブルに追加する関数

    Parameters
    ------------------------------------------------------------------------
    datas (list)    : 追加対象のメンバー一覧
    """
    dt = datetime.now(timezone.utc).strftime('%Y-%m-%d %H:%M:%S')
    member_dic = get_member_dict()
    sql = 'INSERT INTO latests (member_id, subscriber, diff, round_subscriber, round_datetime, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?);'
    latest_list = []
    name_index = datas[0].index('name')
    for member in datas[1:]:
        name = member[name_index]
        latest_list.append([member_dic[name],0,0,0,dt,dt,dt])
    exec_sql(sql, latest_list)
    return


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


if __name__ == '__main__':
    args = parser.parse_args()
    datas = get_csv(args.mode, args.file)
    sql = make_sql(args.mode, datas[0])
    exec_sql(sql, datas[1:])
    if args.mode == 'add':
        add_latest(datas)
