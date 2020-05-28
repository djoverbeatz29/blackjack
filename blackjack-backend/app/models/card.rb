class Card < ApplicationRecord
  belongs_to :deck
  belongs_to :hand

  attr_accessor :suit, :rank, :value

  def initialize(params)
    @suit = params[:suit]
    @rank = params[:rank]
    @value = set_value(params[:rank])
  end

  def set_value(rank)
    if ['10', 'J', 'Q', 'K'].include?(rank)
      10
    elsif rank == 'A'
      11
    else
      rank.to_i
    end
  end

end
