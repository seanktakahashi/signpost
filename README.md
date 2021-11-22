# Sean's Signpost

- For generating a __public__ and __private__ signpost for guiding me to
all my websites
- Hosted at [signpost.seanktakahashi.com](https://signpost.seanktakahashi.com)

# Compilation

- The websites are generated from a `signpost.json` at the root of the repo
  - This file is a list of websites for the signposts to contain
- Websites in the signpost can either be public of private
  - Public websites have fields (`name`, `description`, `url`)
  - Private websites can have the same fields along with the special fields
    (`username` and `password`). If a private website doesn't have these
    special fields, it can have a field (`hidden`) to indicate it is private.
- Compile the website to `docs/` with the command:
  ```
  node compile.js <password>
  ```
- This command builds a website a root `/` and at `/private`
  - The root is publically visible, and contains all public websites 
  - The private path can only be read by entering the password,
    and contains all public and private websites

# How It Works

- Symetric key cryptography
  - A key is generated from the entered passed (PBKDF2 w/ SHA256)
  - This key encrypts the private signpost values with AES in CBC mode
- The key is only entered at compile time the encrypt and then into the user's
  local browser to decrypt. The password nor key are ever sent or recieved.

# Inspaired By

[staticrypt](https://github.com/robinmoisson/staticrypt)

