# This file is auto-generated from the current state of the database. Instead
# of editing this file, please use the migrations feature of Active Record to
# incrementally modify your database, and then regenerate this schema definition.
#
# This file is the source Rails uses to define your schema when running `bin/rails
# db:schema:load`. When creating a new database, `bin/rails db:schema:load` tends to
# be faster and is potentially less error prone than running all of your
# migrations from scratch. Old migrations may fail to apply correctly if those
# migrations use external dependencies or application code.
#
# It's strongly recommended that you check this file into your version control system.

ActiveRecord::Schema[7.0].define(version: 2023_09_28_133217) do
  create_table "latests", force: :cascade do |t|
    t.integer "subscriber"
    t.integer "diff"
    t.integer "round_subscriber"
    t.datetime "round_datetime"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.integer "member_id"
    t.index ["member_id"], name: "index_latests_on_member_id", unique: true
  end

  create_table "members", force: :cascade do |t|
    t.string "name"
    t.string "channel_name"
    t.string "belong"
    t.string "debut"
    t.string "birthday"
    t.string "graduation"
    t.text "twitter"
    t.text "thumbnails"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.string "youtube_id"
    t.string "name_en"
    t.string "belong_en"
    t.string "name_kana"
    t.string "color"
    t.string "name_url"
    t.boolean "active", default: true
    t.index ["name"], name: "index_members_on_name"
    t.index ["name_url"], name: "index_members_on_name_url"
  end

  create_table "trackers", force: :cascade do |t|
    t.integer "subscriber"
    t.integer "video_count"
    t.integer "video_viewcount"
    t.datetime "datetime"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.integer "member_id"
    t.index ["datetime"], name: "index_trackers_on_datetime"
    t.index ["member_id"], name: "index_trackers_on_member_id"
  end

  add_foreign_key "latests", "members"
  add_foreign_key "trackers", "members"
end
