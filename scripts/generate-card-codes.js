// 从 products.ts 提取的所有 product/spec ID 对
const specs = [
  // 王者荣耀
  ['wz-001', 'wz-001-s1'], ['wz-001', 'wz-001-s2'], ['wz-001', 'wz-001-s3'], ['wz-001', 'wz-001-s4'],
  ['wz-002', 'wz-002-s1'], ['wz-002', 'wz-002-s2'],
  ['wz-003', 'wz-003-s1'], ['wz-003', 'wz-003-s2'],
  ['wz-004', 'wz-004-s1'], ['wz-004', 'wz-004-s2'], ['wz-004', 'wz-004-s3'],
  ['wz-005', 'wz-005-s1'], ['wz-005', 'wz-005-s2'],
  ['wz-006', 'wz-006-s1'], ['wz-006', 'wz-006-s2'], ['wz-006', 'wz-006-s3'],
  ['wz-007', 'wz-007-s1'], ['wz-007', 'wz-007-s2'],
  ['wz-008', 'wz-008-s1'], ['wz-008', 'wz-008-s2'], ['wz-008', 'wz-008-s3'],
  // 原神
  ['ys-001', 'ys-001-s1'], ['ys-001', 'ys-001-s2'], ['ys-001', 'ys-001-s3'], ['ys-001', 'ys-001-s4'],
  ['ys-002', 'ys-002-s1'], ['ys-002', 'ys-002-s2'],
  ['ys-003', 'ys-003-s1'],
  ['ys-004', 'ys-004-s1'], ['ys-004', 'ys-004-s2'],
  ['ys-005', 'ys-005-s1'],
  ['ys-006', 'ys-006-s1'], ['ys-006', 'ys-006-s2'],
  ['ys-007', 'ys-007-s1'], ['ys-007', 'ys-007-s2'], ['ys-007', 'ys-007-s3'],
  ['ys-008', 'ys-008-s1'], ['ys-008', 'ys-008-s2'],
  // 和平精英
  ['hp-001', 'hp-001-s1'], ['hp-001', 'hp-001-s2'], ['hp-001', 'hp-001-s3'], ['hp-001', 'hp-001-s4'],
  ['hp-002', 'hp-002-s1'], ['hp-002', 'hp-002-s2'],
  ['hp-003', 'hp-003-s1'], ['hp-003', 'hp-003-s2'],
  ['hp-004', 'hp-004-s1'], ['hp-004', 'hp-004-s2'],
  ['hp-005', 'hp-005-s1'], ['hp-005', 'hp-005-s2'],
  ['hp-006', 'hp-006-s1'], ['hp-006', 'hp-006-s2'],
  // 英雄联盟
  ['lol-001', 'lol-001-s1'], ['lol-001', 'lol-001-s2'], ['lol-001', 'lol-001-s3'], ['lol-001', 'lol-001-s4'],
  ['lol-002', 'lol-002-s1'], ['lol-002', 'lol-002-s2'],
  ['lol-003', 'lol-003-s1'],
  ['lol-004', 'lol-004-s1'], ['lol-004', 'lol-004-s2'],
  ['lol-005', 'lol-005-s1'], ['lol-005', 'lol-005-s2'], ['lol-005', 'lol-005-s3'],
  ['lol-006', 'lol-006-s1'], ['lol-006', 'lol-006-s2'],
  // Steam
  ['st-001', 'st-001-s1'], ['st-001', 'st-001-s2'], ['st-001', 'st-001-s3'], ['st-001', 'st-001-s4'],
  ['st-002', 'st-002-s1'], ['st-002', 'st-002-s2'],
  ['st-003', 'st-003-s1'], ['st-003', 'st-003-s2'], ['st-003', 'st-003-s3'],
  ['st-004', 'st-004-s1'], ['st-004', 'st-004-s2'],
  ['st-005', 'st-005-s1'], ['st-005', 'st-005-s2'],
  ['st-006', 'st-006-s1'], ['st-006', 'st-006-s2'], ['st-006', 'st-006-s3'],
  ['st-007', 'st-007-s1'], ['st-007', 'st-007-s2'],
  ['st-008', 'st-008-s1'], ['st-008', 'st-008-s2'],
  // PUBG
  ['pubg-001', 'pubg-001-s1'], ['pubg-001', 'pubg-001-s2'], ['pubg-001', 'pubg-001-s3'],
  ['pubg-002', 'pubg-002-s1'],
  ['pubg-003', 'pubg-003-s1'], ['pubg-003', 'pubg-003-s2'],
  ['pubg-004', 'pubg-004-s1'], ['pubg-004', 'pubg-004-s2'],
  // Minecraft
  ['mc-001', 'mc-001-s1'], ['mc-001', 'mc-001-s2'], ['mc-001', 'mc-001-s3'],
  ['mc-002', 'mc-002-s1'],
  ['mc-003', 'mc-003-s1'], ['mc-003', 'mc-003-s2'],
  ['mc-004', 'mc-004-s1'], ['mc-004', 'mc-004-s2'],
  // Roblox
  ['rb-001', 'rb-001-s1'], ['rb-001', 'rb-001-s2'], ['rb-001', 'rb-001-s3'], ['rb-001', 'rb-001-s4'],
  ['rb-002', 'rb-002-s1'], ['rb-002', 'rb-002-s2'], ['rb-002', 'rb-002-s3'],
  ['rb-003', 'rb-003-s1'], ['rb-003', 'rb-003-s2'],
  ['rb-004', 'rb-004-s1'], ['rb-004', 'rb-004-s2'],
  // 天涯明月刀
  ['ty-001', 'ty-001-s1'], ['ty-001', 'ty-001-s2'], ['ty-001', 'ty-001-s3'],
  ['ty-002', 'ty-002-s1'], ['ty-002', 'ty-002-s2'],
  ['ty-003', 'ty-003-s1'], ['ty-003', 'ty-003-s2'],
  ['ty-004', 'ty-004-s1'], ['ty-004', 'ty-004-s2'],
  // 剑网三
  ['jw-001', 'jw-001-s1'], ['jw-001', 'jw-001-s2'], ['jw-001', 'jw-001-s3'], ['jw-001', 'jw-001-s4'],
  ['jw-002', 'jw-002-s1'], ['jw-002', 'jw-002-s2'],
  ['jw-003', 'jw-003-s1'], ['jw-003', 'jw-003-s2'],
  ['jw-004', 'jw-004-s1'], ['jw-004', 'jw-004-s2'],
]

const CODES_PER_SPEC = 15

function randomHex(len) {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
  let result = ''
  for (let i = 0; i < len; i++) {
    result += chars[Math.floor(Math.random() * chars.length)]
  }
  return result
}

function generateCode(specId, index) {
  const prefix = specId.toUpperCase().replace(/-/g, '')
  return `${prefix}-${randomHex(4)}-${randomHex(4)}-${String(index).padStart(3, '0')}`
}

let sql = 'INSERT INTO card_codes (product_id, spec_id, code) VALUES\n'
const values = []

for (const [productId, specId] of specs) {
  for (let i = 1; i <= CODES_PER_SPEC; i++) {
    const code = generateCode(specId, i)
    values.push(`('${productId}', '${specId}', '${code}')`)
  }
}

sql += values.join(',\n') + ';\n'
process.stdout.write(sql)
