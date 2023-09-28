require "json"


class Tracker < ApplicationRecord
    belongs_to :member, foreign_key: "member_id"
    scope :active_user, -> { joins(:member).select("member.name, trackers.subscriber, trackers.datetime").where(member: {active: true}).merge(Tracker.order(:datetime)) }
    scope :member_all_subscriber, -> (name) {
        joins(:member)
        .select("member.name, trackers.subscriber, MAX(trackers.datetime) AS datetime")
        .where(member: {name_url: name})
        .group('trackers.member_id, strftime("%Y%m", trackers.datetime)')
        .merge(Tracker.order(:datetime))
    }
    scope :member_24hours_subscriber, -> (name) {
        joins(:member)
        .select("trackers.subscriber, MAX(trackers.datetime) AS datetime")
        .where(
            member: {name_url: name},
            trackers: {datetime: Time.now - 25.hour...}
        )
        .group('trackers.member_id, strftime("%Y%m%d%H", trackers.datetime)')
        .merge(Tracker.order("datetime DESC"))
    }
    scope :member_14days_subscriber, -> (name) {
        joins(:member)
        .select("trackers.subscriber, trackers.video_viewcount, MAX(trackers.datetime) AS datetime")
        .where(
            member: {name_url: name},
            trackers: {datetime: Time.now - 15.day...}
        )
        .group('trackers.member_id, strftime("%Y%m", trackers.datetime)')
        .merge(Tracker.order("datetime DESC"))
    }
    scope :test, -> {
    }
end
