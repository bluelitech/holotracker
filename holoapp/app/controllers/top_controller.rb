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
    def sitemap
        render xml: File.read("#{Rails.root}/public/sitemap.xml")
    end
    def ads
        render xml: File.read("#{Rails.root}/public/ads.txt")
    end
end
