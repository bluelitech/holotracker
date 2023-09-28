# メンバーの追加
## CSVファイルを作成する
下記のフォーマットに沿ってCSVを作成する。  
```csv:hololive.csv
name,name_kana,name_en,name_url,belong,belong_en,debut,birthday,color,twitter,youtube_id
百鬼あやめ,なきり あやめ,Nakiri Ayame,nakiriayame,2期生,2nd,2018-09-03,12-13,red,https://twitter.com/nakiriayame,UC7fk0CB07ly8oSl0aqKkqFg
```

## 追加コマンドを実行する
```bash
$ python3 ./tools/members.py hololive.csv add
```
既存メンバーを更新する際は`update`を使用する。