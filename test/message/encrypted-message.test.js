require('requirish')._(module);
require('should');
var tl = require('telegram-tl-node');
var auth = require('lib/auth');
var mtproto = require('lib/mtproto');
var TypeObject = require('telegram-tl-node').TypeObject;
var EncryptedMessage = require('lib/message/encrypted-message');
var SequenceNumber = require('lib/sequence-number');

describe('EncryptedMessage', function() {


    var authKey = new auth.AuthKey(
        new Buffer('4efd920588a83ac9', 'hex'),
        new Buffer('33843a2caeb2452873c89349fd8f7221ba734c8df5e05c122a9e36b036995afc81057270b71b6375ae1ccf59514519748bbb0ec508dde9d17bce70e3dcf685b3731917b144710233f0d4b6a1d69b37722eaa075c5aeabde8d1848ef04af661055f52ab406ab7df8dec44a7ddcbf9de5be36ace00ecfbf5cb69b156c18a469e70658b99ecc2d1ff8de47cf573589b475833016a327f855965b7f541a9926651e50e4dcea69ebb5adbe2cc6ad49b36d38c6058c9f1fff06b07688ccb129e20aef00d77912a2f61cb82274fa86d0aa24b58c9e12cad8c751c6da2831ec635d053bd99b26a6fc83a28c64ff5c94efb5ef82356783c6f2ca0b55a074de82de553c6cb', 'hex')
    );

    describe('#init()', function() {
        it('should return an instance', function() {

            var msg = new EncryptedMessage();
            msg.should.be.ok;
            msg.should.be.an.instanceof(EncryptedMessage);
            msg.should.be.an.instanceof(TypeObject);
            msg.isReadonly().should.be.false;

            var message = new Buffer('ffff', 'hex');
            msg = new EncryptedMessage({
                message: message,
                authKey: authKey,
                serverSalt: '0xfce2ec8fa401b366',
                sessionId: '0x77907373a54aba77',
                sequenceNumber: new SequenceNumber()
            });
            msg.should.have.properties({
                authKey: authKey,
                body: message
            });
            msg.innerMessage.should.have.properties({
                server_salt: '0xfce2ec8fa401b366',
                session_id: '0x77907373a54aba77'
            });
            msg.innerMessage.payload.should.have.properties({
                seqno: 1,
                bytes: 2
            });

            msg = new EncryptedMessage({buffer: new Buffer('FFFF', 'hex')});
            msg.retrieveBuffer().toString('hex').should.equal('ffff');
        })
    });

    describe('#serialize()', function () {
        it('should serialize the msg', function (done) {
            var msg = new EncryptedMessage({
                message: 'ffff',
                authKey: authKey,
                serverSalt: '0xfce2ec8fa401b366',
                sessionId: '0x77907373a54aba77',
                sequenceNumber: new SequenceNumber()
            });
            msg.innerMessage.payload.msg_id = '0x84739073a54aba84';
            var buffer = msg.serialize();
            buffer.should.be.ok;
            console.log(buffer.toString('hex'));
            buffer.slice(0, -16).toString('hex').should.be.equal('4efd920588a83ac9885bda4c4bde1243252290042cd6e2aff35150888ae03a47d8f8fcebde1afe68d0be2afd7ff559346832f4ed0474cb3c');
            done();
        })
    });

    describe('#deserialize()', function () {
        it('should deserialize the msg', function () {

            var encMsg = new EncryptedMessage({
                buffer: new Buffer('4efd920588a83ac9885bda4c4bde1243252290042cd6e2aff35150888ae03a47d8f8fcebde1afe68d0be2afd7ff559346832f4ed0474cb3c72a7364a6ad67534b65b0f75093d5252', 'hex'),
                authKey: authKey});
            var decrypted = encMsg.deserialize(true);
            decrypted.should.be.ok;

            var msg = decrypted;
            msg.body.toString('hex').should.equal('ffff');
            msg.should.have.properties({
                serverSalt: '0xfce2ec8fa401b366',
                sessionId: '0x77907373a54aba77',
                sequenceNumber: 1
            });

            msg.innerMessage.should.be.an.instanceof(EncryptedMessage.InnerMessage);
            msg.innerMessage.should.have.properties({
                server_salt: '0xfce2ec8fa401b366',
                session_id: '0x77907373a54aba77'
            });
            msg.innerMessage.payload.should.be.an.instanceof(mtproto.type.Message);
            msg.innerMessage.payload.bytes.should.be.equal(2);
            msg.innerMessage.payload.body.toString('hex').should.equal('ffff');
        })
    });
});
