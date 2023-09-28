class ChangeTrackerMainKey < ActiveRecord::Migration[7.0]
  def change
    add_reference :trackers, :member, foreign_key: true
    remove_column :trackers, :name
  end
end
