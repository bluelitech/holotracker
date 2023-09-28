class AddColumnNameUrl < ActiveRecord::Migration[7.0]
  def change
    add_column :members, :name_url, :string
  end
end
