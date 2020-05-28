class CreateCards < ActiveRecord::Migration[6.0]
  def change
    create_table :cards do |t|
      t.string :suit
      t.string :rank
      t.integer :value
      t.references :deck, null: false, foreign_key: true
      t.references :hand, null: false, foreign_key: true

      t.timestamps
    end
  end
end
