use dep::fuzk;
use dep::std;
use mimc::mimc_bn254;

fn main(
    address: pub Field,
    note: pub Field,
    asset: pub Field,
    amount: pub Field,
    rho: Field,
    note_footer: pub Field,
    pub_key: [Field; 2],
    signature: [u8; 64],
) {
    println(note);
    fuzk::assert_note(note, asset, amount, rho, pub_key, Option::some(0));

    fuzk::assert_note_footer(note_footer, rho, pub_key);

    let signature_domain = 1;

    let m = mimc_bn254([signature_domain, note, address, note_footer]);
    let m_bytes = fuzk::to_bytes(m);
    let v = std::schnorr::verify_signature(pub_key[0], pub_key[1], signature, m_bytes);

    assert(v);
}
