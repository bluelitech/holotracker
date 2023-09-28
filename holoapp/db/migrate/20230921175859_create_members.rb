class CreateMembers < ActiveRecord::Migration[7.0]
  def change
    create_table :members do |t|
      t.string :name
      t.string :channel_name
      t.string :belong
      t.date :debut
      t.date :birthday
      t.date :graduation
      t.integer :stature
      t.string :fanname
      t.string :fanmark
      t.string :nickname
      t.text :twitter
      t.text :thumbnails
      t.timestamps
    end
  end
end
