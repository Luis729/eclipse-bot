module.exports = {
   name: 'proto',
   description: 'Prototype\'s command',
   usage: '[summon | reference]',
   execute(message, args) {
      switch (args[0]) {
         case 'summon': this.summonPeril(message, 15); break;
         case 'reference': this.referencePeril(message); break;
         default: message.channel.send('`He can\'t code shit`'); break;
      }
   },

   summonPeril(message, num) {
      if (num == 0)
         return;

      if (message.author.id != 262864849300619264 && message.author.id != 293571982883028992) {
         message.channel.send('You do not have enough swag to do this.');
         return;
      }

      message.channel.send('<@166611344995385344> `He can\'t code shit`');
      setTimeout(() => {
         this.summonPeril(message, num - 1);
      }, 1000);
   },

   referencePeril(message) {
      message.channel.send('```PERIL - Today at 1:12 PM\nProto can\'t code shit```');
   },
};
