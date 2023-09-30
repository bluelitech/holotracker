class MemberController < ApplicationController
    def show
        @members = Member.active_user
        @member = Member.one(params[:name]).first
        @belongs = Member.belongs(@members, params[:locale])
        @locale = params[:locale]

        unless @member
            redirect_to '/'
        end
    end
    def index
        name = params[:name]
        if name == nil then
            redirect_to '/'
        else
            redirect_to "/member/#{name}"
        end
    end
    def subscriber_all
        subscriber_all = Tracker.member_all_subscriber(params[:name])
        render json: subscriber_all
    end
    def subscriber_24hours
        subscriber_24hours = Tracker.member_24hours_subscriber(params[:name])
        render json: subscriber_24hours
    end
    def subscriber_14days
        subscriber_14days = Tracker.member_14days_subscriber(params[:name])
        render json: subscriber_14days
    end
    def round
        rounds = JSON.load(File.read("#{Rails.root}/../data/rounds.json"))
        render json: rounds[params[:name]]
    end
end
