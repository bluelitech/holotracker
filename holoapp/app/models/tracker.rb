require "json"


class Tracker < ApplicationRecord
    belongs_to :member, foreign_key: "member_id"
    scope :member_all_subscriber, -> (name) {
        joins(:member)
        .select("trackers.id, member.name, member.name_en, trackers.subscriber, MAX(trackers.datetime) AS datetime")
        .where(
            member: {name_url: name},
            trackers: {datetime: (Time.now - 30.day).to_date...Time.now.to_date}
        )
        .group('strftime("%Y%m%d", trackers.datetime)')
        .merge(Tracker.order(:datetime))
    }
    scope :member_24hours_subscriber, -> (name) {
        joins(:member)
        .select('trackers.id, trackers.subscriber, MAX(trackers.datetime) AS datetime')
        .where(
            member: {name_url: name},
            trackers: {datetime: (Time.now - 25.hour)...Time.now}
        )
        .group('strftime("%Y%m%d%H", trackers.datetime)')
        .merge(Tracker.order("datetime DESC"))
    }
    scope :member_14days_subscriber, -> (name) {
        joins(:member)
        .select("trackers.id, trackers.subscriber, trackers.video_viewcount, MAX(trackers.datetime) AS datetime")
        .where(
            member: {name_url: name},
            trackers: {datetime: (Time.now - 15.day).to_date...Time.now.to_date}
        )
        .group('strftime("%Y%m%d", trackers.datetime)')
        .merge(Tracker.order("datetime DESC"))
    }
end
