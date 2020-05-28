class CreateAccounts < ActiveRecord::Migration[6.0]
  def change
    create_table :accounts do |t|
      t.integer :balance
      t.references :player, null: false, foreign_key: true

      t.timestamps
    end
  end
end
