class Deck < ApplicationRecord
  belongs_to :round
  has_many :cards

  SUITS = ['Hearts', 'Diamonds', 'Clubs', 'Spades']
  RANKS = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K']

  def initialize(n = 6)
    @cards = []
    n.times do |t|
      SUITS.each do |suit|
        RANKS.each do |rank|
          @cards << Card.new(:suit => suit, :rank => rank)
        end
      end
    end
    @cards.shuffle!
  end

end
