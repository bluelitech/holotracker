class Latest < ApplicationRecord
    belongs_to :member, foreign_key: "member_id"
    scope :active_user, -> { includes(:member).where(member: {active: true}) }
end
