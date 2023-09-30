Rails.application.routes.draw do
  # Define your application routes per the DSL in https://guides.rubyonrails.org/routing.html

  # Defines the root path route ("/")
  # root "articles#index"
  get '/', to: 'top#index'
  get '/en', to: 'top#index'
  get '/tracker', to: 'top#tracker'
  get '/test', to: 'top#test'
  get '/member', to: 'member#index'
  get '/member/:name', to: 'member#show'
  get '/member/:name/subscriber_all', to: 'member#subscriber_all'
  get '/member/:name/subscriber_24hours', to: 'member#subscriber_24hours'
  get '/member/:name/subscriber_14days', to: 'member#subscriber_14days'
  get '/member/:name/round', to: 'member#round'
end
