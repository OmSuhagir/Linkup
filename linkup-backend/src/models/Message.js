// const mongoose = require('mongoose');

// const messageSchema = new mongoose.Schema({
//   sender: {
//     type: mongoose.Schema.Types.ObjectId,
//     ref: 'User',
//     required: true
//   },
//   receiver: {
//     type: mongoose.Schema.Types.ObjectId,
//     ref: 'User'
//   },
//   teamId: {
//     type: mongoose.Schema.Types.ObjectId,
//     ref: 'Team'
//   },
//   message: {
//     type: String,
//     required: true,
//     trim: true
//   },
//   timestamp: {
//     type: Date,
//     default: Date.now
//   }
// });

// // Ensure either receiver or teamId is present
// // Note: Validation is already done in socket handlers, this is just a safety check
// messageSchema.pre('save', function(next) {
//   // Only validate if both are absent - we allow either receiver or teamId
//   if (!this.receiver && !this.teamId) {
//     return next(new Error('Message must have either a receiver or a teamId'));
//   }
//   next();
// });

// module.exports = mongoose.model('Message', messageSchema);


const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
  sender: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  receiver: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  teamId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Team'
  },
  message: {
    type: String,
    required: true,
    trim: true
  },
  timestamp: {
    type: Date,
    default: Date.now
  }
});

// ✅ FIXED: Use async middleware instead of next()
messageSchema.pre('save', async function () {
  // Must have either receiver OR teamId
  if (!this.receiver && !this.teamId) {
    throw new Error('Message must have either a receiver or a teamId');
  }

  // Prevent both being present (important edge case)
  if (this.receiver && this.teamId) {
    throw new Error('Message cannot have both receiver and teamId');
  }
});

module.exports = mongoose.model('Message', messageSchema);