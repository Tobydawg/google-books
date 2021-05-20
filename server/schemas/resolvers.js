const { AuthenticationError } = require("apollo-server-express");
const { User } = require("../models");
const { signToken } = require("../utils/auth");

const resolvers = {
  Query: {
    me: async (parent, args, context) => {
      if (context.user) {
        const userData = await User.findOne({ _id: context.user._id }).select(
          "-__v -password"
        );
        // .populate('thoughts')
        // .populate('friends');
            console.log(userData)
        return userData;
      }
      throw new AuthenticationError("Not logged in");
    },
  },

  //   user async (parent, { username }) => {
  //     return User.findOne({ username }).select("-__v -password");
  //   },

  //   users async () => {
  //     return User.find().select("-__v -password");
  //   }
  // },

  Mutation: {
    addUser: async (parent, args) => {
      const user = await User.create(args);
      const token = signToken(user);

      return { token, user };
    },

    removeUser: async (parent, args) => {
      const user = await User.findOneAndDelete(args);
      return user;
    },

    login: async (parent, { email, password }) => {
      const user = await User.findOne({ email });
      const correctPw = await user.isCorrectPassword(password);
      console.log(user);
      // if (!user) {
      //   throw new AuthenticationError("Not found!");

      //   if (!pw) {
      //     throw new AuthenticationError("Nope");
      //   }

      const token = signToken(user);
      return { token, user };
    },
    
    savedBook: async (parent, { bookData }, context) => {
      console.log(context.user, context);
      if (context.user) {
        const updateUser = await User.findByIdAndUpdate(
          { _id: context.user._id },
          { $push: { savedBooks: bookData } },
          { new: true, runValidators: true }
        );
        return updateUser;
      }
      throw new AuthenticationError("You need to be logged in!");
    },
    removeBook: async (parent, { bookId }, context) => {
      if (context.user) {
        const updateBook = await User.findOneAndUpdate(
          { _id: context.user._id },
          { $pull: { savedBooks: {bookId} } },
          { new: true, runValidators: true }
        );
        return updateBook;
      }
      throw new AuthenticationError("You must be loggedin!");
    },
  },
};

module.exports = resolvers;
