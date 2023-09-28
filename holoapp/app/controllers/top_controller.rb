class TopController < ApplicationController
    def index
        @latests = Latest.active_user
        @members = Member.active_user
    end
    def tracker
        @trackers = File.read("#{Rails.root}/../data/holodata.json")
        render json: @trackers
    end
    def test
        @trackers = Tracker.member_round(params[:name])
        render json: @trackers
    end
end