class MillionController < ApplicationController
    def index
        @members = Member.active_user
        @belongs = Member.belongs(@members, params[:locale])
        @locale = params[:locale]
        @forecasts = JSON.load(File.read("#{Rails.root}/../data/forecasts.json"))
    end
end
