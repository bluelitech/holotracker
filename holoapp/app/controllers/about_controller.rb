class AboutController < ApplicationController
    def index
        @members = Member.active_user
        @belongs = Member.belongs(@members, params[:locale])
        @locale = params[:locale]
        @hide_adsense = true
    end
end
