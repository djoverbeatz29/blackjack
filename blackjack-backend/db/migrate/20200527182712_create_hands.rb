class CreateHands < ActiveRecord::Migration[6.0]
  def change
    create_table :hands do |t|
      t.references :player, null: false, foreign_key: true
      t.references :round, null: false, foreign_key: true

      t.timestamps
    end
  end
end
