class AddColumnKana < ActiveRecord::Migration[7.0]
  def change
    add_column :members, :name_kana, :string
    add_column :members, :color, :string
  end
end
