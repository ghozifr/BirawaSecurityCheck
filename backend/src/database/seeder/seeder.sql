CREATE DATABASE IF NOT EXISTS birawa;
USE birawa;
CREATE TABLE roles (
    id CHAR(36) PRIMARY KEY,
    nama ENUM('admin', 'mitra') UNIQUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP DEFAULT NULL,
    created_by CHAR(36),
    updated_by CHAR(36)
);
CREATE TABLE permissions (
    id CHAR(36) PRIMARY KEY,
    role_id CHAR(36),
    nama VARCHAR(100) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP DEFAULT NULL,
    created_by CHAR(36),
    updated_by CHAR(36),
    UNIQUE(role_id, nama),
    FOREIGN KEY (role_id) REFERENCES roles(id) ON DELETE SET NULL
);
CREATE TABLE users (
    id CHAR(36) PRIMARY KEY,
    email VARCHAR(100) UNIQUE NOT NULL,
    role_id CHAR(36),
    nama_lengkap VARCHAR(100),
    nomor_telepon VARCHAR(50),
    verification_token VARCHAR(255),
    is_verified BOOLEAN DEFAULT FALSE,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP DEFAULT NULL,
    created_by CHAR(36),
    updated_by CHAR(36),
    FOREIGN KEY (role_id) REFERENCES roles(id) ON DELETE SET NULL
);
CREATE TABLE mitra (
    id CHAR(36) PRIMARY KEY,
    nama VARCHAR(100) UNIQUE NOT NULL,
    nomor_telepon VARCHAR(50),
    alamat VARCHAR(100),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP DEFAULT NULL,
    created_by CHAR(36),
    updated_by CHAR(36)
);
CREATE TABLE mitra_users (
    id CHAR(36) PRIMARY KEY,
    mitra_id CHAR(36),
    user_id CHAR(36),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP DEFAULT NULL,
    created_by CHAR(36),
    updated_by CHAR(36),
    UNIQUE(mitra_id, user_id),
    FOREIGN KEY (mitra_id) REFERENCES mitra(id) ON DELETE SET NULL,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
);
CREATE TABLE users_hashed_password (
    user_id CHAR(36) PRIMARY KEY,
    hashed_password VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP DEFAULT NULL,
    created_by CHAR(36),
    updated_by CHAR(36),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
CREATE TABLE users_hashed_refresh_token (
    user_id CHAR(36) PRIMARY KEY,
    hashed_refresh_token VARCHAR(255) NOT NULL,
    expires_at BIGINT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP DEFAULT NULL,
    created_by CHAR(36),
    updated_by CHAR(36),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
CREATE TABLE inbox (
    id CHAR(36) PRIMARY KEY,
    sender_id CHAR(36),
    receiver_id CHAR(36),
    receiver_type ENUM('admin', 'mitra') NOT NULL,
    judul VARCHAR(100) NOT NULL,
    isi VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP DEFAULT NULL,
    created_by CHAR(36),
    updated_by CHAR(36),
    FOREIGN KEY (sender_id) REFERENCES users(id) ON DELETE SET NULL
);
CREATE TABLE kontrak (
    id CHAR(36) PRIMARY KEY,
    mitra_id CHAR(36),
    nama VARCHAR(100),
    nomor VARCHAR(100),
    tanggal DATE,
    nilai INTEGER,
    jangka_waktu INTEGER,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP DEFAULT NULL,
    created_by CHAR(36),
    updated_by CHAR(36),
    UNIQUE(mitra_id, nomor),
    FOREIGN KEY (mitra_id) REFERENCES mitra(id) ON DELETE SET NULL
);
CREATE TABLE kontrak_ss_pekerjaan (
    id CHAR(36) PRIMARY KEY,
    kontrak_id CHAR(36),
    nama VARCHAR(100),
    lokasi VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP DEFAULT NULL,
    created_by CHAR(36),
    updated_by CHAR(36),
    UNIQUE(kontrak_id, nama),
    FOREIGN KEY (kontrak_id) REFERENCES kontrak(id) ON DELETE SET NULL
);
CREATE TABLE shift (
    id CHAR(36) PRIMARY KEY,
    nama ENUM('1', '2'),
    waktu_mulai TIME,
    waktu_berakhir TIME,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP DEFAULT NULL,
    created_by CHAR(36),
    updated_by CHAR(36)
);
CREATE TABLE tipe_tenaga_kerja (
    id CHAR(36) PRIMARY KEY,
    nama ENUM('manajemen', 'lapangan'),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP DEFAULT NULL,
    created_by CHAR(36),
    updated_by CHAR(36)
);
CREATE TABLE peran_tenaga_kerja (
    id CHAR(36) PRIMARY KEY,
    tipe_tenaga_kerja_id CHAR(36),
    nama VARCHAR(100) UNIQUE NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP DEFAULT NULL,
    created_by CHAR(36),
    updated_by CHAR(36),
    FOREIGN KEY (tipe_tenaga_kerja_id) REFERENCES tipe_tenaga_kerja(id) ON DELETE SET NULL
);
CREATE TABLE tenaga_kerja (
    id CHAR(36) PRIMARY KEY,
    kontrak_ss_pekerjaan_id CHAR(36),
    shift_id CHAR(36),
    peran_tenaga_kerja_id CHAR(36),
    jumlah INTEGER,
    tanggal DATE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP DEFAULT NULL,
    created_by CHAR(36),
    updated_by CHAR(36),
    UNIQUE(kontrak_ss_pekerjaan_id, shift_id, peran_tenaga_kerja_id, tanggal),
    FOREIGN KEY (kontrak_ss_pekerjaan_id) REFERENCES kontrak_ss_pekerjaan(id) ON DELETE SET NULL,
    FOREIGN KEY (shift_id) REFERENCES shift(id) ON DELETE SET NULL,
    FOREIGN KEY (peran_tenaga_kerja_id) REFERENCES peran_tenaga_kerja(id) ON DELETE SET NULL
);
CREATE TABLE tipe_aktivitas (
    id CHAR(36) PRIMARY KEY,
    nama VARCHAR(100) UNIQUE NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP DEFAULT NULL,
    created_by CHAR(36),
    updated_by CHAR(36)
);
CREATE TABLE aktivitas (
    id CHAR(36) PRIMARY KEY,
    kontrak_ss_pekerjaan_id CHAR(36),
    tipe_aktivitas_id CHAR(36),
    nama VARCHAR(100),
    tanggal DATE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP DEFAULT NULL,
    created_by CHAR(36),
    updated_by CHAR(36),
    FOREIGN KEY (kontrak_ss_pekerjaan_id) REFERENCES kontrak_ss_pekerjaan(id) ON DELETE SET NULL,
    FOREIGN KEY (tipe_aktivitas_id) REFERENCES tipe_aktivitas(id) ON DELETE SET NULL
);
CREATE TABLE tipe_cuaca (
    id CHAR(36) PRIMARY KEY,
    nama ENUM('cerah', 'gerimis', 'hujan'),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP DEFAULT NULL,
    created_by CHAR(36),
    updated_by CHAR(36)
);
CREATE TABLE cuaca (
    id CHAR(36) PRIMARY KEY,
    kontrak_ss_pekerjaan_id CHAR(36),
    tipe_cuaca_id CHAR(36),
    waktu ENUM('pagi', 'siang', 'sore', 'malam'),
    waktu_mulai TIME DEFAULT NULL,
    waktu_berakhir TIME DEFAULT NULL,
    tanggal DATE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP DEFAULT NULL,
    created_by CHAR(36),
    updated_by CHAR(36),
    FOREIGN KEY (kontrak_ss_pekerjaan_id) REFERENCES kontrak_ss_pekerjaan(id) ON DELETE SET NULL,
    FOREIGN KEY (tipe_cuaca_id) REFERENCES tipe_cuaca(id) ON DELETE SET NULL
);
CREATE TABLE dokumentasi (
    id CHAR(36) PRIMARY KEY,
    aktivitas_id CHAR(36),
    link VARCHAR(255),
    deskripsi VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP DEFAULT NULL,
    created_by CHAR(36),
    updated_by CHAR(36),
    FOREIGN KEY (aktivitas_id) REFERENCES aktivitas(id) ON DELETE SET NULL
);
CREATE TABLE laporan (
    id CHAR(36) PRIMARY KEY,
    kontrak_ss_pekerjaan_id CHAR(36),
    tanggal DATE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP DEFAULT NULL,
    created_by CHAR(36),
    updated_by CHAR(36),
    FOREIGN KEY (kontrak_ss_pekerjaan_id) REFERENCES kontrak_ss_pekerjaan(id) ON DELETE SET NULL
);
CREATE TABLE log (
    id CHAR(36) PRIMARY KEY,
    rekaman_id CHAR(36),
    user_id CHAR(36),
    nama_tabel VARCHAR(100),
    perubahan JSON, -- '{"before": {"row_1": "row_1_before_change"}, "after": {"row_2": "row_2_after_change"}}''
    aksi ENUM('insert', 'update', 'delete'),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
-- Data Insertion
-- Insert data into roles
INSERT INTO roles (id, nama, created_by, updated_by)
VALUES (
    UUID(), 'admin', NULL, NULL
    ), 
    (
    UUID(), 'mitra', NULL, NULL
    );
-- Insert data into permission
INSERT INTO permissions (id, role_id, nama, created_by, updated_by)
SELECT 
    UUID(),
    roles.id,
    permission_name.permission,
    NULL,
    NULL
FROM 
    roles
JOIN (
    SELECT 'admin' AS role_name, 'create_user' AS permission
    UNION ALL
    SELECT 'admin', 'get_user'
    UNION ALL
    SELECT 'admin', 'update_user'
    UNION ALL
    SELECT 'admin', 'delete_user'
    UNION ALL
    SELECT 'admin', 'view_all_user'
    UNION ALL
    SELECT 'admin', 'create_mitra'
    UNION ALL
    SELECT 'admin', 'get_mitra'
    UNION ALL
    SELECT 'admin', 'update_mitra'
    UNION ALL
    SELECT 'admin', 'delete_mitra'
    UNION ALL
    SELECT 'admin', 'view_all_mitra'
    UNION ALL
    SELECT 'admin', 'get_mitra_users'
    UNION ALL
    SELECT 'admin', 'get_mitra_kontraks'
    UNION ALL
    SELECT 'admin', 'create_kontrak'
    UNION ALL
    SELECT 'admin', 'get_kontrak_pekerjaans'
    UNION ALL
    SELECT 'admin', 'view_all_kontrak'
    UNION ALL
    SELECT 'admin', 'get_pekerjaan_laporans'
    UNION ALL
    SELECT 'admin', 'get_laporan'
    UNION ALL
    SELECT 'admin', 'view_all_laporan'
    UNION ALL
    SELECT 'admin', 'create_inbox'
    UNION ALL
    SELECT 'mitra', 'get_user'
    UNION ALL
    SELECT 'mitra', 'update_user'
    UNION ALL
    SELECT 'mitra', 'get_mitra'
    UNION ALL
    SELECT 'mitra', 'get_mitra_kontraks'
    UNION ALL
    SELECT 'mitra', 'get_kontrak_pekerjaans'
    UNION ALL
    SELECT 'mitra', 'get_pekerjaan_laporans'
    UNION ALL
    SELECT 'mitra', 'create_laporan'
    UNION ALL
    SELECT 'mitra', 'get_laporan'
    UNION ALL
    SELECT 'mitra', 'create_inbox'
) AS permission_name 
ON roles.nama = permission_name.role_name;
-- Insert data into users
INSERT INTO users (
        id,
        email,
        role_id,
        nama_lengkap,
        nomor_telepon,
        is_verified,
        created_by,
        updated_by
    )
VALUES (
        UUID(),
        'admin@example.com',
        (
            SELECT id
            FROM roles
            WHERE nama = 'admin'
        ),
        'Admin User',
        '081234567890',
        true,
        NULL,
        NULL
    ),
    (
        UUID(),
        'mitra1@example.com',
        (
            SELECT id
            FROM roles
            WHERE nama = 'mitra'
        ),
        'Mitra One',
        '081234567891',
        true,
        NULL,
        NULL
    ),
    (
        UUID(),
        'mitra2@example.com',
        (
            SELECT id
            FROM roles
            WHERE nama = 'mitra'
        ),
        'Mitra Two',
        '081234567892',
        true,
        NULL,
        NULL
    ),
    (
        UUID(),
        'mitra3@example.com',
        (
            SELECT id
            FROM roles
            WHERE nama = 'mitra'
        ),
        'Mitra Three',
        '081234567893',
        true,
        NULL,
        NULL
    ),
    (
        UUID(),
        'mitra4@example.com',
        (
            SELECT id
            FROM roles
            WHERE nama = 'mitra'
        ),
        'Mitra Four',
        '081234567894',
        true,
        NULL,
        NULL
    ),
    (
        UUID(),
        'mitra5@example.com',
        (
            SELECT id
            FROM roles
            WHERE nama = 'mitra'
        ),
        'Mitra Five',
        '081234567895',
        true,
        NULL,
        NULL
    ),
    (
        UUID(),
        'mitra6@example.com',
        (
            SELECT id
            FROM roles
            WHERE nama = 'mitra'
        ),
        'Mitra Six',
        '081234567896',
        true,
        NULL,
        NULL
    ),
    (
        UUID(),
        'mitra7@example.com',
        (
            SELECT id
            FROM roles
            WHERE nama = 'mitra'
        ),
        'Mitra Seven',
        '081234567897',
        true,
        NULL,
        NULL
    ),
    (
        UUID(),
        'mitra8@example.com',
        (
            SELECT id
            FROM roles
            WHERE nama = 'mitra'
        ),
        'Mitra Eight',
        '081234567898',
        true,
        NULL,
        NULL
    ),
    (
        UUID(),
        'mitra9@example.com',
        (
            SELECT id
            FROM roles
            WHERE nama = 'mitra'
        ),
        'Mitra Nine',
        '081234567899',
        true,
        NULL,
        NULL
    ),
    (
        UUID(),
        'mitra10@example.com',
        (
            SELECT id
            FROM roles
            WHERE nama = 'mitra'
        ),
        'Mitra Ten',
        '081234567991',
        true,
        NULL,
        NULL
    ),
    (
        UUID(),
        'mitra11@example.com',
        (
            SELECT id
            FROM roles
            WHERE nama = 'mitra'
        ),
        'Mitra Eleven',
        '081234567992',
        false,
        NULL,
        NULL
    ),
    (
        UUID(),
        'birawaprj@gmail.com',
        (
            SELECT id
            FROM roles
            WHERE nama = 'admin'
        ),
        'Admin Birawa',
        '081386039162',
        true,
        NULL,
        NULL
    );
-- Insert data into mitra
INSERT INTO mitra (
        id,
        nama,
        nomor_telepon,
        alamat,
        created_by,
        updated_by
    )
VALUES (
        UUID(),
        'Mitra Company One',
        '02134567890',
        'mitra_address_1',
        (
            SELECT id
            FROM users
            WHERE email = 'admin@example.com'
        ),
        NULL
    ),
    (
        UUID(),
        'Mitra Company Two',
        '02134567891',
        'mitra_address_2',
        (
            SELECT id
            FROM users
            WHERE email = 'admin@example.com'
        ),
        NULL
    ),
    (
        UUID(),
        'Mitra Company Three',
        '02134567892',
        'mitra_address_3',
        (
            SELECT id
            FROM users
            WHERE email = 'admin@example.com'
        ),
        NULL
    ),
    (
        UUID(),
        'Mitra Company Four',
        '02134567893',
        'mitra_address_4',
        (
            SELECT id
            FROM users
            WHERE email = 'admin@example.com'
        ),
        NULL
    ),
    (
        UUID(),
        'Mitra Company Five',
        '02134567894',
        'mitra_address_5',
        (
            SELECT id
            FROM users
            WHERE email = 'admin@example.com'
        ),
        NULL
    );
-- Insert data into mitra_users
INSERT INTO mitra_users (id, mitra_id, user_id, created_by, updated_by)
VALUES (
        UUID(),
        (
            SELECT id
            FROM mitra
            WHERE nama = 'Mitra Company One'
        ),
        (
            SELECT id
            FROM users
            WHERE email = 'mitra1@example.com'
        ),
        NULL,
        NULL
    ),
    (
        UUID(),
        (
            SELECT id
            FROM mitra
            WHERE nama = 'Mitra Company One'
        ),
        (
            SELECT id
            FROM users
            WHERE email = 'mitra2@example.com'
        ),
        NULL,
        NULL
    ),
    (
        UUID(),
        (
            SELECT id
            FROM mitra
            WHERE nama = 'Mitra Company Two'
        ),
        (
            SELECT id
            FROM users
            WHERE email = 'mitra3@example.com'
        ),
        NULL,
        NULL
    ),
    (
        UUID(),
        (
            SELECT id
            FROM mitra
            WHERE nama = 'Mitra Company Two'
        ),
        (
            SELECT id
            FROM users
            WHERE email = 'mitra4@example.com'
        ),
        NULL,
        NULL
    ),
    (
        UUID(),
        (
            SELECT id
            FROM mitra
            WHERE nama = 'Mitra Company Three'
        ),
        (
            SELECT id
            FROM users
            WHERE email = 'mitra5@example.com'
        ),
        NULL,
        NULL
    ),
    (
        UUID(),
        (
            SELECT id
            FROM mitra
            WHERE nama = 'Mitra Company Three'
        ),
        (
            SELECT id
            FROM users
            WHERE email = 'mitra6@example.com'
        ),
        NULL,
        NULL
    ),
    (
        UUID(),
        (
            SELECT id
            FROM mitra
            WHERE nama = 'Mitra Company Four'
        ),
        (
            SELECT id
            FROM users
            WHERE email = 'mitra7@example.com'
        ),
        NULL,
        NULL
    ),
    (
        UUID(),
        (
            SELECT id
            FROM mitra
            WHERE nama = 'Mitra Company Four'
        ),
        (
            SELECT id
            FROM users
            WHERE email = 'mitra8@example.com'
        ),
        NULL,
        NULL
    ),
    (
        UUID(),
        (
            SELECT id
            FROM mitra
            WHERE nama = 'Mitra Company Five'
        ),
        (
            SELECT id
            FROM users
            WHERE email = 'mitra9@example.com'
        ),
        NULL,
        NULL
    ),
    (
        UUID(),
        (
            SELECT id
            FROM mitra
            WHERE nama = 'Mitra Company Five'
        ),
        (
            SELECT id
            FROM users
            WHERE email = 'mitra10@example.com'
        ),
        NULL,
        NULL
    ),
    (
        UUID(),
        (
            SELECT id
            FROM mitra
            WHERE nama = 'Mitra Company Five'
        ),
        (
            SELECT id
            FROM users
            WHERE email = 'mitra11@example.com'
        ),
        NULL,
        NULL
    );
-- Insert data into users_hashed_password
INSERT INTO users_hashed_password (user_id, hashed_password, created_by, updated_by)
VALUES (
        (
            SELECT id
            FROM users
            WHERE email = 'admin@example.com'
        ),
        'admin',
        NULL,
        NULL
    ),
    (
        (
            SELECT id
            FROM users
            WHERE email = 'mitra1@example.com'
        ),
        'mitra1',
        NULL,
        NULL
    ),
    (
        (
            SELECT id
            FROM users
            WHERE email = 'mitra2@example.com'
        ),
        'mitra2',
        NULL,
        NULL
    ),
    (
        (
            SELECT id
            FROM users
            WHERE email = 'mitra3@example.com'
        ),
        'mitra3',
        NULL,
        NULL
    ),
    (
        (
            SELECT id
            FROM users
            WHERE email = 'mitra4@example.com'
        ),
        'mitra4',
        NULL,
        NULL
    ),
    (
        (
            SELECT id
            FROM users
            WHERE email = 'mitra5@example.com'
        ),
        'mitra5',
        NULL,
        NULL
    ),
    (
        (
            SELECT id
            FROM users
            WHERE email = 'mitra6@example.com'
        ),
        'mitra6',
        NULL,
        NULL
    ),
    (
        (
            SELECT id
            FROM users
            WHERE email = 'mitra7@example.com'
        ),
        'mitra7',
        NULL,
        NULL
    ),
    (
        (
            SELECT id
            FROM users
            WHERE email = 'mitra8@example.com'
        ),
        'mitra8',
        NULL,
        NULL
    ),
    (
        (
            SELECT id
            FROM users
            WHERE email = 'mitra9@example.com'
        ),
        'mitra9',
        NULL,
        NULL
    ),
    (
        (
            SELECT id
            FROM users
            WHERE email = 'mitra10@example.com'
        ),
        'mitra10',
        NULL,
        NULL
    ),
    (
        (
            SELECT id
            FROM users
            WHERE email = 'mitra11@example.com'
        ),
        'mitra11',
        NULL,
        NULL
    ),
    (
        (
            SELECT id
            FROM users
            WHERE email = 'birawaprj@gmail.com'
        ),
        'birawaprj',
        NULL,
        NULL
    );
-- Insert data into users_hashed_refresh_token
INSERT INTO users_hashed_refresh_token (
        user_id,
        hashed_refresh_token,
        expires_at,
        created_by,
        updated_by
    )
VALUES (
        (
            SELECT id
            FROM users
            WHERE email = 'admin@example.com'
        ),
        'c9e4bfc318283d47081f9c765df2ce2299fa0e8000c116bf067fad8af08b98a890fe02fd17dbd0e2b6fae586de89b6032a78750f8643cfed728be0595790c727',
        1729209600000,
        NULL,
        NULL
    ),
    (
        (
            SELECT id
            FROM users
            WHERE email = 'mitra1@example.com'
        ),
        '5fcec6d5a3e1ddcc18c06fef407e83ebf43f614072d9a3b6ba1dc253488ac4e6f869a25af3a5d62c243db606d7db8849fa7e70ef6247b62475fb33574d306222',
        1729209600000,
        NULL,
        NULL
    ),
    (
        (
            SELECT id
            FROM users
            WHERE email = 'mitra2@example.com'
        ),
        'e1c2a0527f2a649e886e7ab1cda30ac52b06db9f886783046e7a71963ca832411c96d4755c907eab1ef665a429693e8e5fa0f51be98f29379ac64e7aa0790f1b',
        1729209600000,
        NULL,
        NULL
    ),
    (
        (
            SELECT id
            FROM users
            WHERE email = 'mitra3@example.com'
        ),
        'f1548e14915648fd7d6ac752f29a5ac6fe31ed8e637e1b01170e4c7c919c11a91d290dae7b47e332aa53cd4bf99c85263ca3691220fab73f8d80096d11004f6e',
        1729209600000,
        NULL,
        NULL
    ),
    (
        (
            SELECT id
            FROM users
            WHERE email = 'mitra4@example.com'
        ),
        '423976b48927fef4981cfa0c60c3449cb00b8b5205ea312f45e97d076f575f1896491d20ed99f6f988de903070f0104e8f775c31611fabe5e3b575ae03624355',
        1729209600000,
        NULL,
        NULL
    ),
    (
        (
            SELECT id
            FROM users
            WHERE email = 'mitra5@example.com'
        ),
        '05faf0a0e78b7e9514d306df9cdfa37f400bb797d482dc5c0397a14b93a4bdda2d5e800c8c658a1985f6f5bae1ab5d3e0b726ba3528803de8ccc738f5e08557f',
        1729209600000,
        NULL,
        NULL
    ),
    (
        (
            SELECT id
            FROM users
            WHERE email = 'mitra6@example.com'
        ),
        '6a99139ff404724006c0f07ba2ee40fbb2d0b0aeb04b6314775bfe10dbe3d7483358e1161069fb558f8efc04a59ebd661b594364b9d60a4ee65d93b2be6e43c7',
        1729209600000,
        NULL,
        NULL
    ),
    (
        (
            SELECT id
            FROM users
            WHERE email = 'mitra7@example.com'
        ),
        '9af610bb4f990abc967b2ca448b6db5a244d97cad3ddd28e8bace9d8172e55bc28bde670e64a13c1348dff8e69b0a205ec93688b0a1a8565ce0588cca0f6d6ee',
        1729209600000,
        NULL,
        NULL
    ),
    (
        (
            SELECT id
            FROM users
            WHERE email = 'mitra8@example.com'
        ),
        '6bd8e036afad2421e05f6653c1d2e66a3781fb3ebd52bd44ef6c5a847353d0a23f0dcab11c21cb569c8b3259b6f1c767a7fbf0c24954f062aff65f95d762e277',
        1729209600000,
        NULL,
        NULL
    ),
    (
        (
            SELECT id
            FROM users
            WHERE email = 'mitra9@example.com'
        ),
        'ad37e63f7cf41d743cb06acbaa70b79a3f4ac72d03885b3534e9f785f00d6f008e1dc85a16cc659a025f20e2ed36758bf9f8f39c35f35b118e4b206f2be72d49',
        1729209600000,
        NULL,
        NULL
    ),
    (
        (
            SELECT id
            FROM users
            WHERE email = 'mitra10@example.com'
        ),
        '6131665896f5ea3cb572f8dd2bfe4901aad1ef99c01a82ce527ec2e1d26b38fd411b36bd1a3d3710f7057f3265d1deba315288102832e0972536168575e80708',
        1729209600000,
        NULL,
        NULL
    ),
    (
        (
            SELECT id
            FROM users
            WHERE email = 'mitra11@example.com'
        ),
        '916c37d19ecc7f5f4c37662ae8ea72fead796477d41b293d1445b759de5bc3dbb327338a90c20cd646e478517ddd6e526b4d2fc3ef28dfd780fdef3b10ea9cfc',
        1729209600000,
        NULL,
        NULL
    ),
    (
        (
            SELECT id
            FROM users
            WHERE email = 'birawaprj@gmail.com'
        ),
        '123c37d19ecc7f5f4c37662ae8ea72fead796477d41b293d1445b759de5bc3dbb327338a90c20cd646e478517ddd6e526b4d2fc3ef28dfd780fdef3b10ea9cfc',
        1729209600000,
        NULL,
        NULL
    );
-- Insert data into inbox
INSERT INTO inbox (
        id,
        sender_id,
        receiver_id,
        receiver_type,
        judul,
        isi,
        created_by,
        updated_by
    )
VALUES (
        UUID(),
        (
            SELECT id
            FROM users
            WHERE email = 'admin@example.com'
        ),
        (
            SELECT id
            FROM mitra
            WHERE nama = 'Mitra Company One'
        ),
        'mitra',
        'title_1',
        'content_1',
        NULL,
        NULL
    ),
    (
        UUID(),
        (
            SELECT id
            FROM users
            WHERE email = 'admin@example.com'
        ),
        (
            SELECT id
            FROM mitra
            WHERE nama = 'Mitra Company Two'
        ),
        'mitra',
        'title_2',
        'content_2',
        NULL,
        NULL
    ),
    (
        UUID(),
        (
            SELECT id
            FROM users
            WHERE email = 'admin@example.com'
        ),
        (
            SELECT id
            FROM mitra
            WHERE nama = 'Mitra Company Three'
        ),
        'mitra',
        'title_3',
        'content_3',
        NULL,
        NULL
    ),
    (
        UUID(),
        (
            SELECT id
            FROM users
            WHERE email = 'admin@example.com'
        ),
        (
            SELECT id
            FROM mitra
            WHERE nama = 'Mitra Company Four'
        ),
        'mitra',
        'title_4',
        'content_4',
        NULL,
        NULL
    ),
    (
        UUID(),
        (
            SELECT id
            FROM users
            WHERE email = 'admin@example.com'
        ),
        (
            SELECT id
            FROM mitra
            WHERE nama = 'Mitra Company Five'
        ),
        'mitra',
        'title_5',
        'content_5',
        NULL,
        NULL
    ),
    (
        UUID(),
        (
            SELECT id
            FROM users
            WHERE email = 'admin@example.com'
        ),
        (
            SELECT id
            FROM mitra
            WHERE nama = 'Mitra Company Six'
        ),
        'mitra',
        'title_6',
        'content_6',
        NULL,
        NULL
    ),
    (
        UUID(),
        (
            SELECT id
            FROM users
            WHERE email = 'admin@example.com'
        ),
        (
            SELECT id
            FROM mitra
            WHERE nama = 'Mitra Company Seven'
        ),
        'mitra',
        'title_7',
        'content_7',
        NULL,
        NULL
    ),
    (
        UUID(),
        (
            SELECT id
            FROM users
            WHERE email = 'admin@example.com'
        ),
        (
            SELECT id
            FROM mitra
            WHERE nama = 'Mitra Company Eight'
        ),
        'mitra',
        'title_8',
        'content_8',
        NULL,
        NULL
    ),
    (
        UUID(),
        (
            SELECT id
            FROM users
            WHERE email = 'admin@example.com'
        ),
        (
            SELECT id
            FROM mitra
            WHERE nama = 'Mitra Company Nine'
        ),
        'mitra',
        'title_9',
        'content_9',
        NULL,
        NULL
    ),
    (
        UUID(),
        (
            SELECT id
            FROM users
            WHERE email = 'admin@example.com'
        ),
        (
            SELECT id
            FROM mitra
            WHERE nama = 'Mitra Company Ten'
        ),
        'mitra',
        'title_10',
        'content_10',
        NULL,
        NULL
    ),
    (
        UUID(),
        (
            SELECT id
            FROM users
            WHERE email = 'admin@example.com'
        ),
        (
            SELECT id
            FROM mitra
            WHERE nama = 'Mitra Company Eleven'
        ),
        'mitra',
        'title_11',
        'content_11',
        NULL,
        NULL
    );
-- Insert data into kontrak
INSERT INTO kontrak (
        id,
        mitra_id,
        nama,
        nomor,
        tanggal,
        nilai,
        jangka_waktu,
        created_by,
        updated_by
    )
VALUES (
        UUID(),
        (
            SELECT id
            FROM mitra
            WHERE nama = 'Mitra Company One'
        ),
        'kontrak_1',
        '1',
        '2024-10-10',
        10000000,
        30,
        NULL,
        NULL
    ),
    (
        UUID(),
        (
            SELECT id
            FROM mitra
            WHERE nama = 'Mitra Company Two'
        ),
        'kontrak_2',
        '1',
        '2024-10-10',
        10000000,
        60,
        NULL,
        NULL
    ),
    (
        UUID(),
        (
            SELECT id
            FROM mitra
            WHERE nama = 'Mitra Company Three'
        ),
        'kontrak_3',
        '1',
        '2024-10-10',
        10000000,
        90,
        NULL,
        NULL
    ),
    (
        UUID(),
        (
            SELECT id
            FROM mitra
            WHERE nama = 'Mitra Company Four'
        ),
        'kontrak_4',
        '1',
        '2024-10-10',
        10000000,
        120,
        NULL,
        NULL
    ),
    (
        UUID(),
        (
            SELECT id
            FROM mitra
            WHERE nama = 'Mitra Company Five'
        ),
        'kontrak_5',
        '1',
        '2024-10-10',
        10000000,
        180,
        NULL,
        NULL
    );
-- Insert data into kontrak_ss_pekerjaan
INSERT INTO kontrak_ss_pekerjaan (
        id,
        kontrak_id,
        nama,
        lokasi,
        created_by,
        updated_by
    )
VALUES (
        UUID(),
        (
            SELECT kontrak.id
            FROM kontrak
            INNER JOIN mitra
            ON kontrak.mitra_id = mitra.id
            WHERE mitra.nama = 'Mitra Company One' AND kontrak.nomor = '1'
        ),
        'pekerjaan_1',
        'lokasi_1',
        NULL,
        NULL
    ),
    (
        UUID(),
        (
            SELECT kontrak.id
            FROM kontrak
            INNER JOIN mitra
            ON kontrak.mitra_id = mitra.id
            WHERE mitra.nama = 'Mitra Company One' AND kontrak.nomor = '1'
        ),
        'pekerjaan_2',
        'lokasi_2',
        NULL,
        NULL
    ),
    (
        UUID(),
        (
            SELECT kontrak.id
            FROM kontrak
            INNER JOIN mitra
            ON kontrak.mitra_id = mitra.id
            WHERE mitra.nama = 'Mitra Company One' AND kontrak.nomor = '1'
        ),
        'pekerjaan_3',
        'lokasi_3',
        NULL,
        NULL
    ),
    (
        UUID(),
        (
            SELECT kontrak.id
            FROM kontrak
            INNER JOIN mitra
            ON kontrak.mitra_id = mitra.id
            WHERE mitra.nama = 'Mitra Company Two' AND kontrak.nomor = '1'
        ),
        'pekerjaan_1',
        'lokasi_1',
        NULL,
        NULL
    ),
    (
        UUID(),
        (
            SELECT kontrak.id
            FROM kontrak
            INNER JOIN mitra
            ON kontrak.mitra_id = mitra.id
            WHERE mitra.nama = 'Mitra Company Two' AND kontrak.nomor = '1'
        ),
        'pekerjaan_2',
        'lokasi_2',
        NULL,
        NULL
    ),
    (
        UUID(),
        (
            SELECT kontrak.id
            FROM kontrak
            INNER JOIN mitra
            ON kontrak.mitra_id = mitra.id
            WHERE mitra.nama = 'Mitra Company Two' AND kontrak.nomor = '1'
        ),
        'pekerjaan_3',
        'lokasi_3',
        NULL,
        NULL
    ),
    (
        UUID(),
        (
            SELECT kontrak.id
            FROM kontrak
            INNER JOIN mitra
            ON kontrak.mitra_id = mitra.id
            WHERE mitra.nama = 'Mitra Company Three' AND kontrak.nomor = '1'
        ),
        'pekerjaan_1',
        'lokasi_1',
        NULL,
        NULL
    ),
    (
        UUID(),
        (
            SELECT kontrak.id
            FROM kontrak
            INNER JOIN mitra
            ON kontrak.mitra_id = mitra.id
            WHERE mitra.nama = 'Mitra Company Three' AND kontrak.nomor = '1'
        ),
        'pekerjaan_2',
        'lokasi_2',
        NULL,
        NULL
    ),
    (
        UUID(),
        (
            SELECT kontrak.id
            FROM kontrak
            INNER JOIN mitra
            ON kontrak.mitra_id = mitra.id
            WHERE mitra.nama = 'Mitra Company Three' AND kontrak.nomor = '1'
        ),
        'pekerjaan_3',
        'lokasi_3',
        NULL,
        NULL
    ),
    (
        UUID(),
        (
            SELECT kontrak.id
            FROM kontrak
            INNER JOIN mitra
            ON kontrak.mitra_id = mitra.id
            WHERE mitra.nama = 'Mitra Company Four' AND kontrak.nomor = '1'
        ),
        'pekerjaan_1',
        'lokasi_1',
        NULL,
        NULL
    ),
    (
        UUID(),
        (
            SELECT kontrak.id
            FROM kontrak
            INNER JOIN mitra
            ON kontrak.mitra_id = mitra.id
            WHERE mitra.nama = 'Mitra Company Four' AND kontrak.nomor = '1'
        ),
        'pekerjaan_2',
        'lokasi_2',
        NULL,
        NULL
    ),
    (
        UUID(),
        (
            SELECT kontrak.id
            FROM kontrak
            INNER JOIN mitra
            ON kontrak.mitra_id = mitra.id
            WHERE mitra.nama = 'Mitra Company Four' AND kontrak.nomor = '1'
        ),
        'pekerjaan_3',
        'lokasi_3',
        NULL,
        NULL
    ),
    (
        UUID(),
        (
            SELECT kontrak.id
            FROM kontrak
            INNER JOIN mitra
            ON kontrak.mitra_id = mitra.id
            WHERE mitra.nama = 'Mitra Company Five' AND kontrak.nomor = '1'
        ),
        'pekerjaan_1',
        'lokasi_1',
        NULL,
        NULL
    ),
    (
        UUID(),
        (
            SELECT kontrak.id
            FROM kontrak
            INNER JOIN mitra
            ON kontrak.mitra_id = mitra.id
            WHERE mitra.nama = 'Mitra Company Five' AND kontrak.nomor = '1'
        ),
        'pekerjaan_2',
        'lokasi_2',
        NULL,
        NULL
    ),
    (
        UUID(),
        (
            SELECT kontrak.id
            FROM kontrak
            INNER JOIN mitra
            ON kontrak.mitra_id = mitra.id
            WHERE mitra.nama = 'Mitra Company Five' AND kontrak.nomor = '1'
        ),
        'pekerjaan_3',
        'lokasi_3',
        NULL,
        NULL
    );
-- Insert data into shift
INSERT INTO shift (
        id,
        nama,
        waktu_mulai,
        waktu_berakhir,
        created_by,
        updated_by
    )
VALUES (
        UUID(),
        '1',
        '08:00:00',
        '15:00:00',
        NULL,
        NULL
    ),
    (
        UUID(),
        '2',
        '15:00:00',
        '22:00:00',
        NULL,
        NULL
    );
-- Insert data into tipe_tenaga_kerja
INSERT INTO tipe_tenaga_kerja (id, nama, created_by, updated_by)
VALUES (
    UUID(), 'manajemen', NULL, NULL
    ),
    (
        UUID(), 'lapangan', NULL, NULL
    );
-- Insert data into peran_tenaga_kerja
INSERT INTO peran_tenaga_kerja (
        id,
        tipe_tenaga_kerja_id,
        nama,
        created_by,
        updated_by
    )
VALUES (
        UUID(),
        (
            SELECT id
            FROM tipe_tenaga_kerja
            WHERE nama = 'manajemen'
        ),
        'Project Manager',
        NULL,
        NULL
    ),
    (
        UUID(),
        (
            SELECT id
            FROM tipe_tenaga_kerja
            WHERE nama = 'manajemen'
        ),
        'Site Manager',
        NULL,
        NULL
    ),
    (
        UUID(),
        (
            SELECT id
            FROM tipe_tenaga_kerja
            WHERE nama = 'lapangan'
        ),
        'Pekerja Sipil',
        NULL,
        NULL
    ),
    (
        UUID(),
        (
            SELECT id
            FROM tipe_tenaga_kerja
            WHERE nama = 'lapangan'
        ),
        'Pekerja Arsitektur',
        NULL,
        NULL
    ),
    (
        UUID(),
        (
            SELECT id
            FROM tipe_tenaga_kerja
            WHERE nama = 'lapangan'
        ),
        'Pekerja Mekanikal Elektrik',
        NULL,
        NULL
    );
-- Insert data into tenaga_kerja
INSERT INTO tenaga_kerja (
        id,
        kontrak_ss_pekerjaan_id,
        shift_id,
        peran_tenaga_kerja_id,
        jumlah,
        tanggal,
        created_by,
        updated_by
    )
VALUES (
        UUID(),
        (
            SELECT kontrak_ss_pekerjaan.id
            FROM kontrak_ss_pekerjaan
            INNER JOIN kontrak
            ON kontrak_ss_pekerjaan.kontrak_id = kontrak.id
            INNER JOIN mitra
            ON kontrak.mitra_id = mitra.id
            WHERE mitra.nama = 'Mitra Company One' AND kontrak.nomor = '1' AND kontrak_ss_pekerjaan.nama = 'pekerjaan_1'
        ),
        (
            SELECT id
            FROM shift
            WHERE nama = '1' AND waktu_mulai = '08:00:00' AND waktu_berakhir = '15:00:00'
        ),
        (
            SELECT id
            FROM peran_tenaga_kerja
            WHERE nama = 'Project Manager'
        ),
        1,
        '2024-10-10',
        NULL,
        NULL
    ),
    (
        UUID(),
        (
            SELECT kontrak_ss_pekerjaan.id
            FROM kontrak_ss_pekerjaan
            INNER JOIN kontrak
            ON kontrak_ss_pekerjaan.kontrak_id = kontrak.id
            INNER JOIN mitra
            ON kontrak.mitra_id = mitra.id
            WHERE mitra.nama = 'Mitra Company One' AND kontrak.nomor = '1' AND kontrak_ss_pekerjaan.nama = 'pekerjaan_1'
        ),
        (
            SELECT id
            FROM shift
            WHERE nama = '1' AND waktu_mulai = '08:00:00' AND waktu_berakhir = '15:00:00'
        ),
        (
            SELECT id
            FROM peran_tenaga_kerja
            WHERE nama = 'Site Manager'
        ),
        2,
        '2024-10-10',
        NULL,
        NULL
    ),
    (
        UUID(),
        (
            SELECT kontrak_ss_pekerjaan.id
            FROM kontrak_ss_pekerjaan
            INNER JOIN kontrak
            ON kontrak_ss_pekerjaan.kontrak_id = kontrak.id
            INNER JOIN mitra
            ON kontrak.mitra_id = mitra.id
            WHERE mitra.nama = 'Mitra Company One' AND kontrak.nomor = '1' AND kontrak_ss_pekerjaan.nama = 'pekerjaan_1'
        ),
        (
            SELECT id
            FROM shift
            WHERE nama = '1' AND waktu_mulai = '08:00:00' AND waktu_berakhir = '15:00:00'
        ),
        (
            SELECT id
            FROM peran_tenaga_kerja
            WHERE nama = 'Pekerja Sipil'
        ),
        3,
        '2024-10-10',
        NULL,
        NULL
    ),
    (
        UUID(),
        (
            SELECT kontrak_ss_pekerjaan.id
            FROM kontrak_ss_pekerjaan
            INNER JOIN kontrak
            ON kontrak_ss_pekerjaan.kontrak_id = kontrak.id
            INNER JOIN mitra
            ON kontrak.mitra_id = mitra.id
            WHERE mitra.nama = 'Mitra Company One' AND kontrak.nomor = '1' AND kontrak_ss_pekerjaan.nama = 'pekerjaan_1'
        ),
        (
            SELECT id
            FROM shift
            WHERE nama = '1' AND waktu_mulai = '08:00:00' AND waktu_berakhir = '15:00:00'
        ),
        (
            SELECT id
            FROM peran_tenaga_kerja
            WHERE nama = 'Pekerja Arsitektur'
        ),
        4,
        '2024-10-10',
        NULL,
        NULL
    ),
    (
        UUID(),
        (
            SELECT kontrak_ss_pekerjaan.id
            FROM kontrak_ss_pekerjaan
            INNER JOIN kontrak
            ON kontrak_ss_pekerjaan.kontrak_id = kontrak.id
            INNER JOIN mitra
            ON kontrak.mitra_id = mitra.id
            WHERE mitra.nama = 'Mitra Company One' AND kontrak.nomor = '1' AND kontrak_ss_pekerjaan.nama = 'pekerjaan_1'
        ),
        (
            SELECT id
            FROM shift
            WHERE nama = '1' AND waktu_mulai = '08:00:00' AND waktu_berakhir = '15:00:00'
        ),
        (
            SELECT id
            FROM peran_tenaga_kerja
            WHERE nama = 'Pekerja Mekanikal Elektrik'
        ),
        5,
        '2024-10-10',
        NULL,
        NULL
    ),
    (
        UUID(),
        (
            SELECT kontrak_ss_pekerjaan.id
            FROM kontrak_ss_pekerjaan
            INNER JOIN kontrak
            ON kontrak_ss_pekerjaan.kontrak_id = kontrak.id
            INNER JOIN mitra
            ON kontrak.mitra_id = mitra.id
            WHERE mitra.nama = 'Mitra Company One' AND kontrak.nomor = '1' AND kontrak_ss_pekerjaan.nama = 'pekerjaan_1'
        ),
        (
            SELECT id
            FROM shift
            WHERE nama = '2' AND waktu_mulai = '15:00:00' AND waktu_berakhir = '22:00:00'
        ),
        (
            SELECT id
            FROM peran_tenaga_kerja
            WHERE nama = 'Project Manager'
        ),
        1,
        '2024-10-10',
        NULL,
        NULL
    ),
    (
        UUID(),
        (
            SELECT kontrak_ss_pekerjaan.id
            FROM kontrak_ss_pekerjaan
            INNER JOIN kontrak
            ON kontrak_ss_pekerjaan.kontrak_id = kontrak.id
            INNER JOIN mitra
            ON kontrak.mitra_id = mitra.id
            WHERE mitra.nama = 'Mitra Company One' AND kontrak.nomor = '1' AND kontrak_ss_pekerjaan.nama = 'pekerjaan_1'
        ),
        (
            SELECT id
            FROM shift
            WHERE nama = '2' AND waktu_mulai = '15:00:00' AND waktu_berakhir = '22:00:00'
        ),
        (
            SELECT id
            FROM peran_tenaga_kerja
            WHERE nama = 'Site Manager'
        ),
        2,
        '2024-10-10',
        NULL,
        NULL
    ),
    (
        UUID(),
        (
            SELECT kontrak_ss_pekerjaan.id
            FROM kontrak_ss_pekerjaan
            INNER JOIN kontrak
            ON kontrak_ss_pekerjaan.kontrak_id = kontrak.id
            INNER JOIN mitra
            ON kontrak.mitra_id = mitra.id
            WHERE mitra.nama = 'Mitra Company One' AND kontrak.nomor = '1' AND kontrak_ss_pekerjaan.nama = 'pekerjaan_1'
        ),
        (
            SELECT id
            FROM shift
            WHERE nama = '2' AND waktu_mulai = '15:00:00' AND waktu_berakhir = '22:00:00'
        ),
        (
            SELECT id
            FROM peran_tenaga_kerja
            WHERE nama = 'Pekerja Sipil'
        ),
        3,
        '2024-10-10',
        NULL,
        NULL
    ),
    (
        UUID(),
        (
            SELECT kontrak_ss_pekerjaan.id
            FROM kontrak_ss_pekerjaan
            INNER JOIN kontrak
            ON kontrak_ss_pekerjaan.kontrak_id = kontrak.id
            INNER JOIN mitra
            ON kontrak.mitra_id = mitra.id
            WHERE mitra.nama = 'Mitra Company One' AND kontrak.nomor = '1' AND kontrak_ss_pekerjaan.nama = 'pekerjaan_1'
        ),
        (
            SELECT id
            FROM shift
            WHERE nama = '2' AND waktu_mulai = '15:00:00' AND waktu_berakhir = '22:00:00'
        ),
        (
            SELECT id
            FROM peran_tenaga_kerja
            WHERE nama = 'Pekerja Arsitektur'
        ),
        4,
        '2024-10-10',
        NULL,
        NULL
    ),
    (
        UUID(),
        (
            SELECT kontrak_ss_pekerjaan.id
            FROM kontrak_ss_pekerjaan
            INNER JOIN kontrak
            ON kontrak_ss_pekerjaan.kontrak_id = kontrak.id
            INNER JOIN mitra
            ON kontrak.mitra_id = mitra.id
            WHERE mitra.nama = 'Mitra Company One' AND kontrak.nomor = '1' AND kontrak_ss_pekerjaan.nama = 'pekerjaan_1'
        ),
        (
            SELECT id
            FROM shift
            WHERE nama = '2' AND waktu_mulai = '15:00:00' AND waktu_berakhir = '22:00:00'
        ),
        (
            SELECT id
            FROM peran_tenaga_kerja
            WHERE nama = 'Pekerja Mekanikal Elektrik'
        ),
        5,
        '2024-10-10',
        NULL,
        NULL
    );
-- Insert data into tipe_aktivitas
INSERT INTO tipe_aktivitas (id, nama, created_by, updated_by)
VALUES (
        UUID(), 'Pekerjaan Sipil', NULL, NULL
    ),
    (
        UUID(), 'Pekerjaan Arsitektur', NULL, NULL
    ),
    (
        UUID(), 'Pekerjaan Mekanikal Elektrik', NULL, NULL
    ),
    (
        UUID(), 'Pekerjaan Furniture', NULL, NULL
    );
-- Insert data into aktivitas
INSERT INTO aktivitas (
        id,
        kontrak_ss_pekerjaan_id,
        tipe_aktivitas_id,
        nama,
        tanggal,
        created_by,
        updated_by
    )
VALUES (
        UUID(),
        (
            SELECT kontrak_ss_pekerjaan.id
            FROM kontrak_ss_pekerjaan
            INNER JOIN kontrak
            ON kontrak_ss_pekerjaan.kontrak_id = kontrak.id
            INNER JOIN mitra
            ON kontrak.mitra_id = mitra.id
            WHERE mitra.nama = 'Mitra Company One' AND kontrak.nomor = '1' AND kontrak_ss_pekerjaan.nama = 'pekerjaan_1'
        ),
        (
            SELECT id
            FROM tipe_aktivitas
            WHERE nama = 'Pekerjaan Sipil'
        ),
        'aktivitas_1',
        '2024-10-10',
        NULL,
        NULL
    ),
    (
        UUID(),
        (
            SELECT kontrak_ss_pekerjaan.id
            FROM kontrak_ss_pekerjaan
            INNER JOIN kontrak
            ON kontrak_ss_pekerjaan.kontrak_id = kontrak.id
            INNER JOIN mitra
            ON kontrak.mitra_id = mitra.id
            WHERE mitra.nama = 'Mitra Company One' AND kontrak.nomor = '1' AND kontrak_ss_pekerjaan.nama = 'pekerjaan_1'
        ),
        (
            SELECT id
            FROM tipe_aktivitas
            WHERE nama = 'Pekerjaan Arsitektur'
        ),
        'aktivitas_2',
        '2024-10-10',
        NULL,
        NULL
    ),
    (
        UUID(),
        (
            SELECT kontrak_ss_pekerjaan.id
            FROM kontrak_ss_pekerjaan
            INNER JOIN kontrak
            ON kontrak_ss_pekerjaan.kontrak_id = kontrak.id
            INNER JOIN mitra
            ON kontrak.mitra_id = mitra.id
            WHERE mitra.nama = 'Mitra Company One' AND kontrak.nomor = '1' AND kontrak_ss_pekerjaan.nama = 'pekerjaan_1'
        ),
        (
            SELECT id
            FROM tipe_aktivitas
            WHERE nama = 'Pekerjaan Mekanikal Elektrik'
        ),
        'aktivitas_3',
        '2024-10-10',
        NULL,
        NULL
    ),
    (
        UUID(),
        (
            SELECT kontrak_ss_pekerjaan.id
            FROM kontrak_ss_pekerjaan
            INNER JOIN kontrak
            ON kontrak_ss_pekerjaan.kontrak_id = kontrak.id
            INNER JOIN mitra
            ON kontrak.mitra_id = mitra.id
            WHERE mitra.nama = 'Mitra Company One' AND kontrak.nomor = '1' AND kontrak_ss_pekerjaan.nama = 'pekerjaan_1'
        ),
        (
            SELECT id
            FROM tipe_aktivitas
            WHERE nama = 'Pekerjaan Furniture'
        ),
        'aktivitas_4',
        '2024-10-10',
        NULL,
        NULL
    );
-- Insert data into tipe_cuaca
INSERT INTO tipe_cuaca (id, nama, created_by, updated_by)
VALUES (
        UUID(), 'cerah', NULL, NULL
    ),
    (
        UUID(), 'gerimis', NULL, NULL
    ),
    (
        UUID(), 'hujan', NULL, NULL
    );
-- Insert data into cuaca
INSERT INTO cuaca (
        id,
        kontrak_ss_pekerjaan_id,
        tipe_cuaca_id,
        waktu,
        waktu_mulai,
        waktu_berakhir,
        tanggal,
        created_by,
        updated_by
    )
VALUES (
        UUID(),
        (
            SELECT kontrak_ss_pekerjaan.id
            FROM kontrak_ss_pekerjaan
            INNER JOIN kontrak
            ON kontrak_ss_pekerjaan.kontrak_id = kontrak.id
            INNER JOIN mitra
            ON kontrak.mitra_id = mitra.id
            WHERE mitra.nama = 'Mitra Company One' AND kontrak.nomor = '1' AND kontrak_ss_pekerjaan.nama = 'pekerjaan_1'
        ),
        (
            SELECT id
            FROM tipe_cuaca
            WHERE nama = 'cerah'
        ),
        'pagi',
        NULL,
        NULL,
        '2024-10-10',
        NULL,
        NULL
    ),
    (
        UUID(),
        (
        SELECT kontrak_ss_pekerjaan.id
        FROM kontrak_ss_pekerjaan
        INNER JOIN kontrak
        ON kontrak_ss_pekerjaan.kontrak_id = kontrak.id
        INNER JOIN mitra
        ON kontrak.mitra_id = mitra.id
        WHERE mitra.nama = 'Mitra Company One' AND kontrak.nomor = '1' AND kontrak_ss_pekerjaan.nama = 'pekerjaan_1'
        ),
        (
            SELECT id
            FROM tipe_cuaca
            WHERE nama = 'cerah'
        ),
        'siang',
        NULL,
        NULL,
        '2024-10-10',
        NULL,
        NULL
    ),
    (
        UUID(),
        (
        SELECT kontrak_ss_pekerjaan.id
        FROM kontrak_ss_pekerjaan
        INNER JOIN kontrak
        ON kontrak_ss_pekerjaan.kontrak_id = kontrak.id
        INNER JOIN mitra
        ON kontrak.mitra_id = mitra.id
        WHERE mitra.nama = 'Mitra Company One' AND kontrak.nomor = '1' AND kontrak_ss_pekerjaan.nama = 'pekerjaan_1'
        ),
        (
            SELECT id
            FROM tipe_cuaca
            WHERE nama = 'gerimis'
        ),
        'sore',
        '15:00:00',
        '15:30:00',
        '2024-10-10',
        NULL,
        NULL
    ),
    (
        UUID(),
        (
        SELECT kontrak_ss_pekerjaan.id
        FROM kontrak_ss_pekerjaan
        INNER JOIN kontrak
        ON kontrak_ss_pekerjaan.kontrak_id = kontrak.id
        INNER JOIN mitra
        ON kontrak.mitra_id = mitra.id
        WHERE mitra.nama = 'Mitra Company One' AND kontrak.nomor = '1' AND kontrak_ss_pekerjaan.nama = 'pekerjaan_1'
        ),
        (
            SELECT id
            FROM tipe_cuaca
            WHERE nama = 'hujan'
        ),
        'malam',
        '18:00:00',
        '21:00:00',
        '2024-10-10',
        NULL,
        NULL
    );
-- Insert data into dokumentasi
INSERT INTO dokumentasi (
        id,
        aktivitas_id,
        link,
        deskripsi,
        created_by,
        updated_by
    )
VALUES (
        UUID(),
        (
            SELECT id
            FROM aktivitas
            WHERE nama = 'aktivitas_1'
        ),
        'https://www.youtube.com/watch?v=d9aTL0_T_sI',
        'dokumentasi_1_before',
        NULL,
        NULL
    ),
    (
        UUID(),
        (
            SELECT id
            FROM aktivitas
            WHERE nama = 'aktivitas_1'
        ),
        'https://www.youtube.com/watch?v=d9aTL0_T_sI',
        'dokumentasi_1_after',
        NULL,
        NULL
    ),
    (
        UUID(),
        (
            SELECT id
            FROM aktivitas
            WHERE nama = 'aktivitas_2'
        ),
        'https://www.youtube.com/watch?v=d9aTL0_T_sI',
        'dokumentasi_2_before',
        NULL,
        NULL
    ),
    (
        UUID(),
        (
            SELECT id
            FROM aktivitas
            WHERE nama = 'aktivitas_2'
        ),
        'https://www.youtube.com/watch?v=d9aTL0_T_sI',
        'dokumentasi_2_after',
        NULL,
        NULL
    ),
    (
        UUID(),
        (
            SELECT id
            FROM aktivitas
            WHERE nama = 'aktivitas_3'
        ),
        'https://www.youtube.com/watch?v=d9aTL0_T_sI',
        'dokumentasi_3_before',
        NULL,
        NULL
    ),
    (
        UUID(),
        (
            SELECT id
            FROM aktivitas
            WHERE nama = 'aktivitas_3'
        ),
        'https://www.youtube.com/watch?v=d9aTL0_T_sI',
        'dokumentasi_3_after',
        NULL,
        NULL
    );
-- Insert data into laporan
INSERT INTO laporan (id, kontrak_ss_pekerjaan_id, tanggal, created_by, updated_by)
VALUES (
        UUID(),
        (
        SELECT kontrak_ss_pekerjaan.id
        FROM kontrak_ss_pekerjaan
        INNER JOIN kontrak
        ON kontrak_ss_pekerjaan.kontrak_id = kontrak.id
        INNER JOIN mitra
        ON kontrak.mitra_id = mitra.id
        WHERE mitra.nama = 'Mitra Company One' AND kontrak.nomor = '1' AND kontrak_ss_pekerjaan.nama = 'pekerjaan_1'
        ),
        '2024-10-10',
        (SELECT id FROM users WHERE email = 'admin@example.com'),
        NULL
    );
-- Insert data into log
INSERT INTO log (
        id,
        rekaman_id,
        user_id,
        nama_tabel,
        perubahan,
        aksi
    )
VALUES (
        UUID(),
        UUID(),
        (
            SELECT id
            FROM users
            WHERE email = 'admin@example.com'
        ),
        'tenaga_kerja',
        '{"before": {"jumlah":1}, "after": {"jumlah":2}}',
        'update'
    );