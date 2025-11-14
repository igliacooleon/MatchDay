# MatchDay Smart Contract Tests

Comprehensive test suite for the MatchDay FHE-powered prediction platform smart contracts.

## Test Files

### 1. MatchDay.test.js - Basic League Management
Tests core league creation and management functionality.

**Test Coverage:**
- ✅ Contract deployment
- ✅ League creation with matches
- ✅ League listing
- ✅ Duplicate league prevention
- ✅ Match data validation
- ✅ Array length validation
- ✅ Match retrieval by index
- ✅ Lock time tracking
- ✅ Prize pool initialization
- ✅ Multiple matches handling (up to 10 matches)
- ✅ FHE storage initialization

**Key FHE Operations Tested:**
- League data structure creation
- FHE storage initialization

**Test Count:** 11 tests

---

### 2. MatchDay-Betting.test.js - Encrypted Betting Operations
Tests encrypted entry submission, weight encryption, and bet management.

**Test Coverage:**
- ✅ Encrypted weight submission (`FHE.fromExternal`)
- ✅ Entry creation with encrypted data
- ✅ Prize pool accumulation
- ✅ Double entry prevention
- ✅ Entry fee validation
- ✅ Lock time enforcement for entries
- ✅ Entry adjustment before lock time
- ✅ Adjustment prevention after lock
- ✅ Multiple users with different weights
- ✅ Prediction array validation
- ✅ FHE weight storage and permissions
- ✅ Edge cases: zero weight
- ✅ Edge cases: maximum uint64 weight

**Key FHE Operations Tested:**
- `FHE.fromExternal()` - Converting encrypted input
- `FHE.allow()` - Setting decryption permissions
- Encrypted handle storage
- Weight encryption (euint64)

**Test Count:** 13 tests

---

### 3. MatchDay-Settlement.test.js - Settlement and Prize Claims
Tests league settlement, result verification, and prize distribution.

**Test Coverage:**
- ✅ League settlement with results
- ✅ Pre-lock settlement prevention
- ✅ Double settlement prevention
- ✅ Match result verification
- ✅ Prize claim with decryption
- ✅ Pre-settlement claim prevention
- ✅ Double claim prevention
- ✅ League cancellation
- ✅ Refund claims after cancellation
- ✅ Non-cancelled refund prevention
- ✅ Double refund prevention
- ✅ FHE score calculation
- ✅ FHE decryption in prize distribution
- ✅ Complex multi-match settlement

**Key FHE Operations Tested:**
- `FHE.eq()` - Prediction comparison
- `FHE.select()` - Conditional score assignment
- `FHE.add()` - Score accumulation
- `FHE.mul()` - Weight multiplication
- `FHE.checkSignatures()` - Decryption verification
- `FHE.toBytes32()` - Handle conversion

**Test Count:** 14 tests

---

## Total Test Coverage

- **Total Tests:** 38 tests
- **FHE Operations Covered:** 8 core operations
- **Test Categories:** 3 (Management, Betting, Settlement)

## Running Tests

### Prerequisites

```bash
npm install
```

### Run All Tests

```bash
npx hardhat test
```

### Run Specific Test File

```bash
# Basic league management
npx hardhat test test/MatchDay.test.js

# Betting operations
npx hardhat test test/MatchDay-Betting.test.js

# Settlement and claims
npx hardhat test test/MatchDay-Settlement.test.js
```

### Run with Gas Reporter

```bash
REPORT_GAS=true npx hardhat test
```

### Run with Coverage

```bash
npx hardhat coverage
```

## Test Environment

- **Framework:** Hardhat + Chai
- **Network:** fhEVM Mock (Local)
- **FHE SDK:** @fhevm/hardhat-plugin
- **Solidity:** 0.8.24

## FHE Operations Reference

### Tested FHE Functions

| Function | Purpose | Test File |
|----------|---------|-----------|
| `FHE.fromExternal()` | Convert encrypted input to euint | Betting |
| `FHE.allow()` | Grant decryption permissions | Betting |
| `FHE.eq()` | Compare encrypted values | Settlement |
| `FHE.select()` | Conditional value selection | Settlement |
| `FHE.add()` | Add encrypted values | Settlement |
| `FHE.mul()` | Multiply encrypted values | Settlement |
| `FHE.toBytes32()` | Convert handle for decryption | Settlement |
| `FHE.checkSignatures()` | Verify decryption proof | Settlement |

## Test Patterns

### 1. Encrypted Weight Submission

```javascript
const encrypted = await fhevm
  .createEncryptedInput(contractAddress, userAddress)
  .add64(BigInt(weight))
  .encrypt();

await contract.enterLeague(
  leagueId,
  winnerPicks,
  goalsPicks,
  penaltyPicks,
  encrypted.handles[0],
  encrypted.inputProof,
  { value: entryFee }
);
```

### 2. Time-Based Testing

```javascript
// Advance time past lock time
await ethers.provider.send("evm_increaseTime", [3601]);
await ethers.provider.send("evm_mine", []);
```

### 3. Entry Verification

```javascript
const entry = await contract.getEntry(leagueId, userAddress);
expect(entry[0]).to.equal(true); // exists
expect(entry[1]).to.equal(false); // not claimed
expect(entry[5]).to.not.equal("0x" + "0".repeat(64)); // has handle
```

## Edge Cases Tested

1. **Zero Weight:** Encrypted weight of 0
2. **Maximum Weight:** uint64 max value (2^64 - 1)
3. **Time Boundaries:** Exactly at lock time
4. **Empty Prize Pool:** No entries before settlement
5. **Complex Predictions:** 10+ matches with varied results

## Known Limitations

- Tests run in mock environment (not full fhEVM)
- Decryption oracle responses are simulated
- Gas costs may differ on actual fhEVM network

## Future Test Additions

- [ ] Stress tests with 100+ users
- [ ] Gas optimization benchmarks
- [ ] Front-running attack scenarios
- [ ] Network failure recovery
- [ ] Oracle callback edge cases
