Rails.application.routes.draw do
  scope '(:locale)', locale: /#{I18n.available_locales.map(&:to_s).join('|')}/ do
    get '/', to: 'top#index'
    get '/tracker', to: 'top#tracker'
    get '/member', to: 'member#index'
    get '/member/:name', to: 'member#show'
    get '/member/:name/subscriber_all', to: 'member#subscriber_all'
    get '/member/:name/subscriber_24hours', to: 'member#subscriber_24hours'
    get '/member/:name/subscriber_14days', to: 'member#subscriber_14days'
    get '/member/:name/round', to: 'member#round'
    get '/million', to: 'million#index'
    get '/about', to: 'about#index'
    get '/privacy', to: 'privacy#index'
    get '/sitemap.xml', to: 'top#sitemap'
    match '*path' => 'application#render_404', via: :all
  end
end
