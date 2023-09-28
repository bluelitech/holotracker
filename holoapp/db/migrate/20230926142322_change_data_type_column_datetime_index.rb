class ChangeDataTypeColumnDatetimeIndex < ActiveRecord::Migration[7.0]
  def change
    add_index :trackers, :datetime
  end
end
