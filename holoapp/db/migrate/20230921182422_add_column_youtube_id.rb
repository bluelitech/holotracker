class AddColumnYoutubeId < ActiveRecord::Migration[7.0]
  def change
    add_column :members, :youtube_id, :string
  end
end
