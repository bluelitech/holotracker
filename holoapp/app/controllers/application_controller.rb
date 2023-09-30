class ApplicationController < ActionController::Base
    before_action :set_locale

    def set_locale
        I18n.locale = locale
    end

    def locale
        @locale ||= params[:locale] ||= I18n.default_locale
    end

    def default_url_options(options={})
        options.merge(locale: locale)
    end

    def render_404
        locale = params[:locale]
        if locale == :ja then
            redirect_to '/'
        else
            redirect_to "/#{locale}"
        end
    end
end
