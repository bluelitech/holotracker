class AddUnique < ActiveRecord::Migration[7.0]
  def change
    remove_reference :latests, :member, foreign_key: true
    add_reference :latests, :member, foreign_key: true, index: {unique: true}
  end
end
