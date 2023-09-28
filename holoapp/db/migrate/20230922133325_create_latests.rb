class CreateLatests < ActiveRecord::Migration[7.0]
  def change
    create_table :latests do |t|
      t.references :member, foreign_key: true
      t.integer :subscriber
      t.integer :diff
      t.integer :round_subscriber
      t.datetime :round_datetime
      t.timestamps
    end
  end
end
