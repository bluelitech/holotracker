Rails.application.routes.draw do
  # Define your application routes per the DSL in https://guides.rubyonrails.org/routing.html

  # Defines the root path route ("/")
  # root "articles#index"
  get '/' => 'top#index'
  get '/en' => 'top#index'
  get '/tracker' => 'top#tracker'
  get '/test' => 'top#test'
  get '/member/:name' => 'member#show'
  get '/member/subscriber_all/:name' => 'member#subscriber_all'
  get '/member/subscriber_24hours/:name' => 'member#subscriber_24hours'
  get '/member/subscriber_14days/:name' => 'member#subscriber_14days'
  get '/member/round/:name' => 'member#round'
end
