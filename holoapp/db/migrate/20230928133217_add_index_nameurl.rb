class AddIndexNameurl < ActiveRecord::Migration[7.0]
  def change
    add_index :members, :name_url
    add_index :members, :name
  end
end
