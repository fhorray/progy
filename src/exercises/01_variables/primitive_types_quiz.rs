// I AM NOT DONE

/*
Difficulty: ⭐⭐⭐⭐
Topic: Primitive Types Quiz

Description:
Let's put everything together!

Your task is to complete the function `calculate_price` which:
1. Accepts `quantity` (integer) and `price_per_unit` (float).
2. Returns the total price as an integer (truncated).

You will need to use type casting.
*/

fn calculate_price(quantity: i32, price_per_unit: f64) -> i32 {
    // TODO: Calculate and return the total price as i32
    0
}

fn main() {
    let price = calculate_price(10, 2.5);
    println!("Total price: {}", price);
    assert_eq!(price, 25);

    let price2 = calculate_price(3, 3.33); // 9.99 -> 9
    println!("Total price: {}", price2);
    assert_eq!(price2, 9);
}

#[cfg(test)]
mod tests {
    #[test]
    fn test_main_runs() {
        super::main();
    }
}
