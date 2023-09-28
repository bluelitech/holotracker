class CreateTrackers < ActiveRecord::Migration[7.0]
  def change
    create_table :trackers do |t|
      t.string :name
      t.integer :subscriber
      t.integer :video_count
      t.integer :video_viewcount
      t.datetime :datetime
      t.timestamps
    end
  end
end
