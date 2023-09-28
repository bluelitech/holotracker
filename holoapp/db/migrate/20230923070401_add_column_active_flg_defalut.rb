class AddColumnActiveFlgDefalut < ActiveRecord::Migration[7.0]
  def change
    remove_column :members, :active
    add_column :members, :active, :boolean, default: 1
  end
end
