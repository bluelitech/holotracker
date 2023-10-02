module ApplicationHelper
    def page_title(page_title, locale)
        base_title = (locale == :ja || locale == "ja") ? "ホロとらっかー" : "HoloTracker"
        page_title.empty? ? base_title : "#{page_title} - #{base_title}"
    end
end
