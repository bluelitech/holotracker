class Member < ApplicationRecord
    has_many :trackers, foreign_key: "member_id"
    has_one :latests, foreign_key: "member_id"
    scope :active_user, -> { where(active: true) }
    scope :one, -> (name) {
        joins(:trackers)
        .where(name_url: name)
        .select("members.*, trackers.*")
        .group("members.id")
        .order("trackers.datetime DESC")
        .limit(1)
    }
end
