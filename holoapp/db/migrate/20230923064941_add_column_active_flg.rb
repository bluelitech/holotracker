class AddColumnActiveFlg < ActiveRecord::Migration[7.0]
  def change
    add_column :members, :active, :boolean
  end
end
