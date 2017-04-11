import { Meteor } from 'meteor/meteor';
import { Template } from 'meteor/templating';
import { ReactiveVar } from 'meteor/reactive-var';
import { Questions } from '../collections/question';

import './main.html';

Meteor.subscribe("questions");

Template.hello.onCreated(function helloOnCreated() {
  // counter starts at 0
  console.log('question ', Questions.find({}).fetch());
  this.counter = new ReactiveVar(0);
});

Template.hello.helpers({
  counter() {
    return Template.instance().counter.get();
  },
});

Template.hello.events({
  'click button'(event, instance) {
    console.log('question ', Questions.find({}).fetch());
    // increment the counter when button is clicked
    instance.counter.set(instance.counter.get() + 1);
  },
});
