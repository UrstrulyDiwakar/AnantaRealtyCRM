package com.anantarealty.model;

public class OrganizationBean {

    private AccountInfoBean accountInfo;
    private BillingContactInfoBean billingContactInfo;
    private AddressInfoBean addressInfo;

    // Getters and Setters for the nested bean classes
    public AccountInfoBean getAccountInfo() {
        return accountInfo;
    }

    public void setAccountInfo(AccountInfoBean accountInfo) {
        this.accountInfo = accountInfo;
    }

    public BillingContactInfoBean getBillingContactInfo() {
        return billingContactInfo;
    }

    public void setBillingContactInfo(BillingContactInfoBean billingContactInfo) {
        this.billingContactInfo = billingContactInfo;
    }

    public AddressInfoBean getAddressInfo() {
        return addressInfo;
    }

    public void setAddressInfo(AddressInfoBean addressInfo) {
        this.addressInfo = addressInfo;
    }

    // Inner class for Account Info
    public static class AccountInfoBean {
        private String companyName;
        private String website;
        private String panNo;
        private String applicationTitle;
        private String phone;
        private String gstIn;

        // Getters and Setters
        public String getCompanyName() {
            return companyName;
        }

        public void setCompanyName(String companyName) {
            this.companyName = companyName;
        }

        public String getWebsite() {
            return website;
        }

        public void setWebsite(String website) {
            this.website = website;
        }

        public String getPanNo() {
            return panNo;
        }

        public void setPanNo(String panNo) {
            this.panNo = panNo;
        }

        public String getApplicationTitle() {
            return applicationTitle;
        }

        public void setApplicationTitle(String applicationTitle) {
            this.applicationTitle = applicationTitle;
        }

        public String getPhone() {
            return phone;
        }

        public void setPhone(String phone) {
            this.phone = phone;
        }

        public String getGstIn() {
            return gstIn;
        }

        public void setGstIn(String gstIn) {
            this.gstIn = gstIn;
        }
    }

    // Inner class for Billing Contact Info
    public static class BillingContactInfoBean {
        private String name;
        private String email;
        private String designation;
        private String mobile;

        // Getters and Setters
        public String getName() {
            return name;
        }

        public void setName(String name) {
            this.name = name;
        }

        public String getEmail() {
            return email;
        }

        public void setEmail(String email) {
            this.email = email;
        }

        public String getDesignation() {
            return designation;
        }

        public void setDesignation(String designation) {
            this.designation = designation;
        }

        public String getMobile() {
            return mobile;
        }

        public void setMobile(String mobile) {
            this.mobile = mobile;
        }
    }

    // Inner class for Address Info
    public static class AddressInfoBean {
        private String street1;
        private String city;
        private String street2;
        private String pinCode;

        // Getters and Setters
        public String getStreet1() {
            return street1;
        }

        public void setStreet1(String street1) {
            this.street1 = street1;
        }

        public String getCity() {
            return city;
        }

        public void setCity(String city) {
            this.city = city;
        }

        public String getStreet2() {
            return street2;
        }

        public void setStreet2(String street2) {
            this.street2 = street2;
        }

        public String getPinCode() {
            return pinCode;
        }

        public void setPinCode(String pinCode) {
            this.pinCode = pinCode;
        }
    }
}
