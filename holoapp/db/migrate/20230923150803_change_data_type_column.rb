class ChangeDataTypeColumn < ActiveRecord::Migration[7.0]
  def change
    change_column :members, :debut, :string
    change_column :members, :birthday, :string
    change_column :members, :graduation, :string
  end
end
