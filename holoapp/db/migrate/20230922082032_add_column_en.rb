class AddColumnEn < ActiveRecord::Migration[7.0]
  def change
    add_column :members, :name_en, :string
    add_column :members, :belong_en, :string
    remove_column :members, :stature
    remove_column :members, :fanname
    remove_column :members, :fanmark
    remove_column :members, :nickname
  end
end
