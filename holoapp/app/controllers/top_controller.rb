class TopController < ApplicationController
    def index
        @latests = Latest.active_user
        @members = Member.active_user
        @belongs = Member.belongs(@members, params[:locale])
        @locale = params[:locale]
    end
    def tracker
        @trackers = File.read("#{Rails.root}/../data/holodata.json")
        render json: @trackers
    end
end
