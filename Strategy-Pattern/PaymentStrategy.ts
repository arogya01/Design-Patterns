// Let's explore how we might implement different payment strategies

interface PaymentStrategy {
    validate(payment: Payment): Promise<ValidationResult>;
    process(payment: Payment): Promise<PaymentResult>;
    refund(payment: Payment): Promise<RefundResult>;
  }
  
  class CreditCardStrategy implements PaymentStrategy {
    async validate(payment: Payment): Promise<ValidationResult> {
      // Credit card specific validation logic
      const { cardNumber, expiryDate, cvv } = payment.paymentDetails;
      
      if (!this.isValidCardNumber(cardNumber)) {
        return {
          isValid: false,
          errors: ['Invalid card number']
        };
      }
  
      if (!this.isValidExpiryDate(expiryDate)) {
        return {
          isValid: false,
          errors: ['Card has expired']
        };
      }
  
      return { isValid: true, errors: [] };
    }
  
    async process(payment: Payment): Promise<PaymentResult> {
      // Connect to credit card payment gateway
      const gateway = await CreditCardGateway.connect({
        apiKey: process.env.CREDIT_CARD_API_KEY,
        environment: process.env.NODE_ENV
      });
  
      try {
        const result = await gateway.processPayment({
          amount: payment.amount,
          currency: payment.currency,
          cardDetails: payment.paymentDetails
        });
  
        return {
          success: true,
          transactionId: result.transactionId,
          timestamp: new Date()
        };
      } catch (error) {
        return {
          success: false,
          error: error.message,
          timestamp: new Date()
        };
      }
    }
  
    async refund(payment: Payment): Promise<RefundResult> {
      // Implement refund logic for credit cards
      // Similar to process but with refund-specific operations
    }
  
    private isValidCardNumber(cardNumber: string): boolean {
      // Implement Luhn algorithm for card validation
      return true; // Simplified for example
    }
  
    private isValidExpiryDate(expiryDate: string): boolean {
      // Implement expiry date validation
      return true; // Simplified for example
    }
  }
  
  class PayPalStrategy implements PaymentStrategy {
    async validate(payment: Payment): Promise<ValidationResult> {
      // PayPal specific validation
      const { paypalEmail } = payment.paymentDetails;
      
      if (!this.isValidPayPalEmail(paypalEmail)) {
        return {
          isValid: false,
          errors: ['Invalid PayPal email']
        };
      }
  
      return { isValid: true, errors: [] };
    }
  
    async process(payment: Payment): Promise<PaymentResult> {
      // PayPal specific processing logic
      // Similar structure but different implementation
    }
  
    async refund(payment: Payment): Promise<RefundResult> {
      // PayPal specific refund logic
    }
  
    private isValidPayPalEmail(email: string): boolean {
      // Implement PayPal email validation
      return true; // Simplified for example
    }
  }
  
  // The context class that uses the strategy
  class PaymentProcessor {
    private strategy: PaymentStrategy;
  
    constructor(strategy: PaymentStrategy) {
      this.strategy = strategy;
    }
  
    setStrategy(strategy: PaymentStrategy) {
      this.strategy = strategy;
    }
  
    async processPayment(payment: Payment): Promise<PaymentResult> {
      // Validate before processing
      const validationResult = await this.strategy.validate(payment);
      
      if (!validationResult.isValid) {
        return {
          success: false,
          error: validationResult.errors.join(', '),
          timestamp: new Date()
        };
      }
  
      // Process the payment using the selected strategy
      return await this.strategy.process(payment);
    }
  }
  
  // Usage example
  async function handlePayment(paymentMethod: string, payment: Payment) {
    const processor = new PaymentProcessor(
      paymentMethod === 'credit-card' 
        ? new CreditCardStrategy()
        : new PayPalStrategy()
    );
  
    return await processor.processPayment(payment);
  }