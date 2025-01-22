use dep::std;
use mimc::mimc_bn254;

pub fn assert_amounts(amounts: &mut Vec<Field>) {
    let amounts_size = amounts.len();
    for _ in 0..amounts_size {
        let amount = amounts.pop() as Field;
        // amount.assert_max_bit_size < 252 as u32 > (); need to work on it
        std::field::bn254::assert_gt(amount, 0);
    }
}

pub fn to_bytes(x: Field) -> [u8; 32] {
    let mut x_bytes: [u8; 32] = [0; 32];
    let bytes: [u8; 32] = x.to_le_bytes();
    for i in 0..32 {
        x_bytes[i] = bytes[i];
    }
    x_bytes
}

pub fn note_footer(rho: Field, pub_key: [Field; 2]) -> Field {
    mimc_bn254([mimc_bn254([rho]), pub_key[0], pub_key[1]])
}

pub fn assert_note(
    note: Field,
    asset: Field,
    amount: Field,
    rho: Field,
    pub_key: [Field; 2],
    note_domain_separator: Option<Field>,
) {
    assert_note_with_footer(
        note,
        asset,
        amount,
        note_footer(rho, pub_key),
        note_domain_separator,
    )
}

pub fn assert_note_footer(in_note_footer: Field, rho: Field, pub_key: [Field; 2]) {
    assert(in_note_footer == note_footer(rho, pub_key));
}

pub fn assert_note_with_footer(
    note: Field,
    asset: Field,
    amount: Field,
    footer: Field,
    note_domain_separator: Option<Field>,
) {
    if (note_domain_separator.is_some()) {
        assert(note == mimc_bn254([note_domain_separator.unwrap(), asset, amount, footer]));
    } else {
        let available_domains = [0, 1];

        let mut at_least_one_domain_matches = false;
        for domain in 0..available_domains.len() {
            let note_hash = mimc_bn254([available_domains[domain], asset, amount, footer]);

            if note_hash == note {
                at_least_one_domain_matches = true;
            }
        }

        assert(at_least_one_domain_matches);
    }
}

pub fn assert_nullifier(nullifier: Field, rho: Field, pub_key: [Field; 2]) {
    let arr = [rho, pub_key[0], pub_key[1]];
    assert(nullifier == mimc_bn254(arr));
}
