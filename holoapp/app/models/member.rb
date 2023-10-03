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
    def self.belongs(members, locale)
        belongs = {}
        for member in members do
            if locale == :ja || locale == "ja" then
                data = {
                    "name" => member.name,
                    "name_kana" => member.name_kana,
                    "name_url" => member.name_url
                }
                if belongs.has_key?(member.belong) then
                    belongs[member.belong].push(data)
                else
                    belongs[member.belong] = [data]
                end
            else
                data = {"name" => member.name_en, "name_url" => member.name_url}
                if belongs.has_key?(member.belong_en) then
                    belongs[member.belong_en].push(data)
                else
                    belongs[member.belong_en] = [data]
                end
            end
        end
        return belongs
    end
end
